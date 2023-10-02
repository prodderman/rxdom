import { Context, newContext } from './context';
import { insert } from './runtime';

describe('runtime', () => {
  describe('static insert', () => {
    const container = document.createElement('div');

    const insertWrapper = (context: Context, child: any): Element => {
      const parent = container.cloneNode(true) as ParentNode;
      insert(context, parent, child);
      return parent as Element;
    };

    it('should append strings, numbers, bigints and symbols', () => {
      const context = newContext();
      const parent = container.cloneNode(true) as Element;
      insert(context, parent, 'text');
      expect(parent.childNodes.length).toBe(1);
      expect(parent.innerHTML).toBe('text');

      insert(context, parent, BigInt(42));
      expect(parent.childNodes.length).toBe(2);
      expect(parent.innerHTML).toBe('text42');

      insert(context, parent, 42);
      expect(parent.childNodes.length).toBe(3);
      expect(parent.innerHTML).toBe('text4242');

      insert(context, parent, Symbol(42));
      expect(parent.childNodes.length).toBe(4);
      expect(parent.innerHTML).toBe('text4242Symbol(42)');
    });

    it('should replace a single node', () => {
      const context = newContext();
      const parent = container.cloneNode(true) as Element;
      const current = parent.insertBefore(document.createElement('div'), null);
      expect(parent.childNodes.length).toBe(1);
      expect(parent.innerHTML).toBe('<div></div>');
      insert(context, parent, 1, current);
      expect(parent.innerHTML).toBe('1');
      expect(parent.childNodes.length).toBe(1);
    });

    it(`should mutate the node's text if it's a text node`, () => {
      const context = newContext();
      const parent = container.cloneNode(true) as Element;
      const textNode = document.createElement('text');
      const current = parent.insertBefore(textNode, null);
      const result = insert(context, parent, 1, current);
      expect(parent.innerHTML).toBe('1');
      expect(parent.firstChild).toBe(result);
      expect(parent.childNodes.length).toBe(1);
    });

    it('should replace multiple nodes', () => {
      const context = newContext();
      const parent = container.cloneNode(true) as Element;
      const current = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];
      parent.append(...current);

      expect(parent.innerHTML).toBe('<div></div><div></div><div></div>');
      const result = insert(context, parent, 42, current);
      expect(parent.childNodes.length).toBe(1);
      expect(parent.firstChild).toBe(result);
      expect(parent.innerHTML).toBe('42');
    });

    it(`should replace multiple nodes and mutate the first node's text if it is a text node`, () => {
      const context = newContext();
      const parent = container.cloneNode(true) as Element;
      const current = [
        document.createTextNode('text'),
        document.createElement('div'),
        document.createElement('span'),
      ];
      parent.append(...current);
      expect(parent.innerHTML).toBe('text<div></div><span></span>');

      const result = insert(context, parent, 42, current);
      expect(parent.childNodes.length).toBe(1);
      expect(result).toBe(current[0]);
      expect(parent.innerHTML).toBe('42');
    });

    it('should insert nothing for null, undefined and boolean', () => {
      const context = newContext();
      const nodeNull = insertWrapper(context, null);
      expect(nodeNull.childNodes.length).toBe(1);
      expect(nodeNull.innerHTML).toBe('');

      const nodeUndefined = insertWrapper(context, undefined);
      expect(nodeUndefined.childNodes.length).toBe(1);
      expect(nodeUndefined.innerHTML).toBe('');

      const nodeTrue = insertWrapper(context, true);
      expect(nodeTrue.childNodes.length).toBe(1);
      expect(nodeTrue.innerHTML).toBe('');

      const nodeFalse = insertWrapper(context, false);
      expect(nodeFalse.childNodes.length).toBe(1);
      expect(nodeFalse.innerHTML).toBe('');
    });

    it('should remove all previous nodes for null, undefined and boolean', () => {
      const context = newContext();
      const parent = container.cloneNode(true) as Element;
      const current = [
        document.createTextNode('text'),
        document.createElement('div'),
        document.createElement('span'),
      ];
      parent.append(...current);
      expect(parent.innerHTML).toBe('text<div></div><span></span>');

      const result = insert(context, parent, null, current);
      expect(parent.childNodes.length).toBe(1);
      expect(result).toBe(current[0]);
      expect(parent.innerHTML).toBe('');
    });

    it('should append node', () => {
      const context = newContext();
      const node = insertWrapper(context, document.createElement('div'));
      expect(node.childNodes.length).toBe(1);
      expect(node.innerHTML).toBe('<div></div>');
    });

    it('should replace node', () => {
      const context = newContext();
      const parent = container.cloneNode(true) as Element;
      const current = document.createElement('div');
      parent.append(current);
      expect(parent.innerHTML).toBe('<div></div>');

      const newNode = document.createElement('span');
      const result = insert(context, parent, newNode, current);
      expect(parent.childNodes.length).toBe(1);
      expect(result).toBe(newNode);
      expect(parent.innerHTML).toBe('<span></span>');
    });

    it('should replace multiple nodes', () => {
      const context = newContext();
      const parent = container.cloneNode(true) as Element;
      const current = [
        document.createTextNode('text'),
        document.createElement('div'),
        document.createElement('span'),
      ];
      parent.append(...current);
      expect(parent.innerHTML).toBe('text<div></div><span></span>');

      const newNode = document.createElement('section');
      const result = insert(context, parent, newNode, current);
      expect(parent.childNodes.length).toBe(1);
      expect(result).toBe(newNode);
      expect(parent.innerHTML).toBe('<section></section>');
    });

    it('should recursively evaluate all functions and insert the result of the last one', () => {
      const context = newContext();
      const nestedFn = jest.fn(() => document.createElement('div'));
      const fn = jest.fn(() => nestedFn);
      const node = insertWrapper(context, fn);
      expect(node.childNodes.length).toBe(1);
      expect(node.innerHTML).toBe('<div></div>');
      expect(nestedFn).toHaveBeenCalledTimes(1);
      expect(nestedFn).toHaveBeenCalledWith(context);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(context);
    });

    it('should normalize and insert arrays', () => {
      const context = newContext();
      const parent = container.cloneNode(true) as Element;
      const toInsert1 = [
        true,
        document.createElement('div'),
        () => [document.createElement('section'), '-inner text 1'],
        '-text 1',
        null,
        '-text 2',
      ];

      const toInsert2 = [
        false,
        () => document.createElement('span'),
        undefined,
        [document.createElement('strong'), '-inner text 2'],
        42,
        BigInt(42),
      ];

      const expectedNResult1 = [
        document.createElement('div'),
        document.createElement('section'),
        document.createTextNode('-inner text 1'),
        document.createTextNode('-text 1'),
        document.createTextNode('-text 2'),
      ];
      const expectedNResult2 = [
        document.createElement('span'),
        document.createElement('strong'),
        document.createTextNode('-inner text 2'),
        document.createTextNode('42'),
        document.createTextNode('42'),
      ];

      const result1 = insert(context, parent, toInsert1);
      const result2 = insert(context, parent, toInsert2);
      expect(parent.childNodes.length).toBe(
        expectedNResult1.length + expectedNResult2.length
      );
      expect(result1).toStrictEqual(expectedNResult1);
      expect(result2).toStrictEqual(expectedNResult2);
      expect(parent.innerHTML).toBe(
        '<div></div><section></section>-inner text 1-text 1-text 2<span></span><strong></strong>-inner text 24242'
      );
    });

    it('should normalize and replace current node with an incoming array', () => {
      const context = newContext();
      const parent = container.cloneNode(true) as Element;
      const current = document.createElement('div');
      parent.append(current);
      const toInsert = [
        true,
        document.createElement('div'),
        () => [document.createElement('section'), '-inner text 1'],
        [document.createElement('strong'), '-inner text 2'],
        '-text 1',
        null,
        '-text 2',
      ];

      const expectedNResult = [
        document.createElement('div'),
        document.createElement('section'),
        document.createTextNode('-inner text 1'),
        document.createElement('strong'),
        document.createTextNode('-inner text 2'),
        document.createTextNode('-text 1'),
        document.createTextNode('-text 2'),
      ];

      const result = insert(context, parent, toInsert, current);
      expect(parent.childNodes.length).toBe(expectedNResult.length);
      expect(result).toStrictEqual(expectedNResult);
      expect(parent.innerHTML).toBe(
        '<div></div><section></section>-inner text 1<strong></strong>-inner text 2-text 1-text 2'
      );
    });

    it('should insert nothing if the normalized array is empty', () => {
      const context = newContext();
      const parent = container.cloneNode(true) as Element;
      const toInsert = [
        true,
        false,
        null,
        undefined,
        '',
        () => [null, undefined, true, false],
      ];

      const result = insert(context, parent, toInsert);
      expect(parent.childNodes.length).toBe(1);
      expect(result).toStrictEqual(document.createTextNode(''));
      expect(parent.innerHTML).toBe('');
    });

    it('should replace all current nodes with nothing if the normalized array is empty', () => {
      const context = newContext();
      const parent = container.cloneNode(true) as Element;
      const current = [
        document.createTextNode('text'),
        document.createElement('div'),
      ];
      parent.append(...current);
      const toInsert = [
        true,
        false,
        null,
        undefined,
        '',
        () => [null, undefined, true, false],
      ];

      const result = insert(context, parent, toInsert, current);
      expect(parent.childNodes.length).toBe(1);
      expect(result).toStrictEqual(document.createTextNode(''));
      expect(parent.innerHTML).toBe('');
    });

    it('should do nothing if the inserted element is unrecognized', () => {
      const context = newContext();
      const node = insertWrapper(context, {});
      expect(node.childNodes.length).toBe(0);
      expect(node.innerHTML).toBe('');
    });
  });

  // describe('reactive insert', () => {
  //   const container = document.createElement('div');

  //   const insertWrapper = (context: Context, child: any): Element => {
  //     const parent = container.cloneNode(true) as ParentNode;
  //     insert(context, parent, child);
  //     return parent as Element;
  //   };
  // });
});
