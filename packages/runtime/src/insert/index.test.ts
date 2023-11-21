import { template } from '../template';
import { createContext } from '../core';
import { insert, replaceChildrenWith } from './';

describe('runtime', () => {
  const container = template('<div></div>');

  type NestedArray<T> = Array<T | NestedArray<T>>;
  const insertNodes = (parent: Node, nodes: NestedArray<Node>) => {
    for (const node of nodes) {
      if (Array.isArray(node)) {
        insertNodes(parent, node);
      } else {
        parent.appendChild(node);
      }
    }
  };

  describe('replaceChildrenWith', () => {
    it('should replace the current nodes with the incoming one', () => {
      const parent = container();
      const current: NestedArray<Node> = [
        document.createTextNode('text'),
        document.createTextNode('text'),
        document.createElement('section'),
        document.createElement('span'),
        document.createElement('span'),
        document.createElement('span'),
        document.createTextNode('text'),
        document.createTextNode('text'),
        document.createElement('section'),
        document.createElement('span'),
        document.createElement('span'),
        document.createElement('span'),
        document.createTextNode('text'),
        document.createTextNode('text'),
        document.createElement('section'),
        document.createElement('section'),
        document.createTextNode('text'),
      ];
      insertNodes(parent, current);

      const incomingNode = document.createElement('article');
      const result = replaceChildrenWith(current, incomingNode);

      expect(parent.childNodes.length).toBe(1);
      expect(parent.firstChild).toBe(incomingNode);
      expect(result).toBe(incomingNode);
    });

    it('should replace the current nodes with a text node with the incoming text', () => {
      const parent = container();
      const current: NestedArray<Node> = [
        document.createElement('div'),

        document.createElement('span'),
        document.createElement('span'),
        document.createElement('span'),
        document.createElement('section'),
        document.createElement('section'),
      ];
      insertNodes(parent, current);

      const result = replaceChildrenWith(current, 'text');
      const expectedResult = document.createTextNode('text');

      expect(parent.childNodes.length).toBe(1);
      expect(parent.firstChild).toStrictEqual(expectedResult);
      expect(result).toStrictEqual(expectedResult);
    });

    it('should replace the current nodes with an empty text node if the incoming node was omitted', () => {
      const parent = container();
      const current: NestedArray<Node> = [
        document.createElement('div'),
        document.createElement('span'),
        document.createElement('span'),
        document.createElement('span'),
        document.createElement('section'),
        document.createElement('section'),
      ];
      insertNodes(parent, current);

      const result = replaceChildrenWith(current);
      const expectedResult = document.createTextNode('');

      expect(parent.childNodes.length).toBe(1);
      expect(parent.firstChild).toStrictEqual(expectedResult);
      expect(result).toStrictEqual(expectedResult);
    });

    it('should update text of the latest current text node if it exists and remove the rest', () => {
      const parent = container();
      const currentTextNode = document.createTextNode('old text');
      const current: NestedArray<Node> = [
        document.createElement('div'),

        document.createElement('span'),
        document.createElement('span'),
        document.createElement('span'),
        document.createElement('section'),
        currentTextNode,
        document.createElement('section'),
      ];
      insertNodes(parent, current);

      const result = replaceChildrenWith(current, 'new text');

      expect(parent.childNodes.length).toBe(1);
      expect(parent.firstChild).toBe(currentTextNode);
      expect((parent.firstChild as Text).data).toBe('new text');
      expect(result).toBe(currentTextNode);
    });

    it('should return the same node if it already exists ', () => {
      const parent = container();
      const currentElement = document.createElement('div');
      const current: NestedArray<Node> = [
        document.createElement('div'),

        document.createElement('span'),
        document.createElement('span'),
        document.createElement('span'),
        document.createElement('section'),
        currentElement,
        document.createElement('section'),
      ];
      insertNodes(parent, current);

      const result = replaceChildrenWith(current, currentElement);

      expect(parent.childNodes.length).toBe(1);
      expect(parent.firstChild).toBe(currentElement);
      expect(result).toBe(currentElement);
    });

    it('should replace exactly current nodes', () => {
      const parent = container();
      const notBeDeletedNode = document.createElement('div');
      parent.append(notBeDeletedNode);

      const current: NestedArray<Node> = [
        document.createElement('div'),
        document.createElement('span'),
        document.createElement('span'),
        document.createElement('span'),
        document.createTextNode('text'),
        document.createTextNode('text'),
        document.createElement('section'),
        document.createElement('section'),
        document.createTextNode('text'),
      ];
      insertNodes(parent, current);

      const incomingNode = document.createElement('span');
      const result = replaceChildrenWith(current, incomingNode);

      expect(parent.childNodes.length).toBe(2);
      expect(parent.firstChild).toBe(notBeDeletedNode);
      expect(parent.firstChild?.nextSibling).toBe(incomingNode);
      expect(result).toBe(incomingNode);
    });
  });

  describe('insert', () => {
    it('should append strings, numbers, bigints and symbols as text nodes', () => {
      const parent = container();
      const context = createContext(false);
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

      parent.childNodes.forEach((node) => expect(node.nodeType).toBe(3));
    });

    it(`should update text if it's a text node for strings, numbers, bigints and symbols`, () => {
      const parent = container();
      const current = document.createTextNode('text');
      parent.replaceChildren(current);
      const context = createContext(false);

      const result = insert(context, parent, 42, current);
      expect(parent.innerHTML).toBe('42');
      expect(current).toBe(result);
      expect(parent.firstChild).toBe(current);
      expect(parent.childNodes.length).toBe(1);
    });

    it('should replace a single node with the text one for strings, numbers, bigints and symbols', () => {
      const parent = container();
      const current = document.createElement('div');
      const context = createContext(false);
      parent.replaceChildren(current);

      insert(context, parent, 42, current);
      expect(parent.innerHTML).toBe('42');
      expect(parent.childNodes.length).toBe(1);
    });

    it('should replace multiple nodes with the text node for strings, numbers, bigints and symbols', () => {
      const parent = container();
      const current = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];
      parent.append(...current);
      const context = createContext(false);

      const result = insert(context, parent, 42, current);
      expect(parent.childNodes.length).toBe(1);
      expect(parent.firstChild).toBe(result);
      expect(parent.innerHTML).toBe('42');
    });

    it(`should replace multiple nodes and update the text of the first one if it is a text node`, () => {
      const parent = container();
      const context = createContext(false);
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

    it('should append empty text nodes for null, undefined and boolean', () => {
      const parent = container();
      const context = createContext(false);

      insert(context, parent, null);
      expect(parent.childNodes.length).toBe(1);
      expect(parent.innerHTML).toBe('');

      insert(context, parent, undefined);
      expect(parent.childNodes.length).toBe(2);
      expect(parent.innerHTML).toBe('');

      insert(context, parent, true);
      expect(parent.childNodes.length).toBe(3);
      expect(parent.innerHTML).toBe('');

      insert(context, parent, false);
      expect(parent.childNodes.length).toBe(4);
      expect(parent.innerHTML).toBe('');

      parent.childNodes.forEach((node) => expect(node.nodeType).toBe(3));
    });

    it('should replace all previous nodes with an empty text node for null, undefined and boolean', () => {
      const parent = container();
      const context = createContext(false);
      const current = [
        document.createTextNode('text'),
        document.createElement('div'),
        document.createElement('span'),
      ];
      parent.append(...current);

      const result = insert(context, parent, null, current);
      expect(parent.childNodes.length).toBe(1);
      expect(result).toBe(current[0]);
      expect(parent.innerHTML).toBe('');
      expect(parent.childNodes[0].nodeType).toBe(3);
    });

    it('should append DOM nodes', () => {
      const context = createContext(false);
      const parent = container();

      const node1 = document.createElement('div');
      const result1 = insert(context, parent, node1);
      expect(parent.childNodes.length).toBe(1);
      expect(parent.firstChild).toBe(node1);
      expect(result1).toBe(node1);
      expect(parent.innerHTML).toBe('<div></div>');

      const node2 = document.createElement('span');
      const result2 = insert(context, parent, node2);
      expect(parent.childNodes.length).toBe(2);
      expect(parent.firstChild?.nextSibling).toBe(node2);
      expect(result2).toBe(node2);
      expect(parent.innerHTML).toBe('<div></div><span></span>');
    });

    it('should replace current DOM node', () => {
      const parent = container();
      const context = createContext(false);
      const current = document.createElement('div');
      parent.append(current);

      const newNode = document.createElement('span');

      const result = insert(context, parent, newNode, current);
      expect(parent.childNodes.length).toBe(1);
      expect(result).toBe(newNode);
      expect(parent.innerHTML).toBe('<span></span>');
    });

    it('should evaluate functions with given context and append their result', () => {
      const context = createContext(false);
      const parent = container();

      const makeDiv = jest.fn(() => document.createElement('div'));
      const Component = jest.fn(() => makeDiv);
      insert(context, parent, Component);

      expect(parent.childNodes.length).toBe(1);
      expect(parent.firstChild).toStrictEqual(document.createElement('div'));
      expect(parent.innerHTML).toBe('<div></div>');
      expect(Component).toHaveBeenNthCalledWith(1, context);
      expect(makeDiv).toHaveBeenNthCalledWith(1, context);
    });

    it('should append an array of nodes', () => {
      const parent = container();
      const context = createContext(false);

      const toInsert1 = [
        42,
        document.createElement('div'),
        document.createElement('span'),
      ];

      insert(context, parent, toInsert1);
      expect(parent.childNodes.length).toBe(3);
      expect(parent.innerHTML).toBe('42<div></div><span></span>');

      const toInsert2 = [document.createElement('section'), 'text'];

      insert(context, parent, toInsert2);
      expect(parent.childNodes.length).toBe(5);
      expect(parent.innerHTML).toBe(
        '42<div></div><span></span><section></section>text'
      );
    });

    // it('should replace the current array of nodes with the other single node', () => {
    //   const parent = container();
    //   const context = createContext(false);
    //   const current = [
    //     document.createTextNode('text'),
    //     document.createElement('div'),
    //     document.createElement('span'),
    //   ];
    //   parent.append(...current);

    //   const newNode = document.createElement('section');
    //   const result = insert(context, parent, newNode, current);
    //   expect(parent.childNodes.length).toBe(1);
    //   expect(result).toBe(newNode);
    //   expect(parent.innerHTML).toBe('<section></section>');
    // });

    // it('should append nested arrays of nodes', () => {
    //   const context = createContext(false);
    //   const parent = container();
    //   const makeText = jest.fn(() => 'function');

    //   const toInsert1 = [
    //     true,
    //     document.createElement('div'),
    //     makeText,
    //     [document.createElement('section'), 'text 1'],
    //     ' text 2',
    //     null,
    //     ' text 3',
    //   ];

    //   const toInsert2 = [
    //     false,
    //     document.createElement('span'),
    //     undefined,
    //     [document.createElement('strong'), 'text 1'],
    //     42,
    //     BigInt(42),
    //   ];

    //   const expectedNResult1 = [
    //     document.createTextNode(''),
    //     document.createElement('div'),
    //     document.createTextNode('function'),
    //     document.createElement('section'),
    //     document.createTextNode('text 1'),
    //     document.createTextNode(' text 2'),
    //     document.createTextNode(''),
    //     document.createTextNode(' text 3'),
    //   ];

    //   const result1 = insert(context, parent, toInsert1);
    //   expect(parent.childNodes.length).toBe(expectedNResult1.length);
    //   expect(result1).toStrictEqual(expectedNResult1);
    //   expect(makeText).toHaveBeenCalledTimes(1);
    //   expect(makeText).toHaveBeenCalledWith(context);
    //   expect(parent.innerHTML).toBe(
    //     '<div></div>function<section></section>text 1 text 2 text 3'
    //   );

    //   const expectedNResult2 = [
    //     document.createTextNode(''),
    //     document.createElement('span'),
    //     document.createTextNode(''),
    //     document.createElement('strong'),
    //     document.createTextNode('text 1'),
    //     document.createTextNode('42'),
    //     document.createTextNode('42'),
    //   ];

    //   const result2 = insert(context, parent, toInsert2);
    //   expect(parent.childNodes.length).toBe(
    //     expectedNResult1.length + expectedNResult2.length
    //   );
    //   expect(result2).toStrictEqual(expectedNResult2);
    //   expect(parent.innerHTML).toBe(
    //     '<div></div>function<section></section>text 1 text 2 text 3<span></span><strong></strong>text 14242'
    //   );
    // });

    // it('should replace the current node with an incoming array', () => {
    //   const parent = container();
    //   const context = createContext(false);
    //   const current = document.createElement('div');
    //   parent.append(current);

    //   const toInsert = [
    //     true,
    //     document.createElement('div'),
    //     [document.createElement('section'), 'inner text 1'],
    //     [document.createElement('strong'), 'inner text 2'],
    //     ' text 1',
    //     null,
    //     ' text 2',
    //   ];

    //   const expectedNResult = [
    //     document.createTextNode(''),
    //     document.createElement('div'),
    //     document.createElement('section'),
    //     document.createTextNode('inner text 1'),
    //     document.createElement('strong'),
    //     document.createTextNode('inner text 2'),
    //     document.createTextNode(' text 1'),
    //     document.createTextNode(''),
    //     document.createTextNode(' text 2'),
    //   ];

    //   const result = insert(context, parent, toInsert, current);
    //   expect(parent.childNodes.length).toBe(expectedNResult.length);
    //   expect(result).toStrictEqual(expectedNResult);
    //   expect(parent.innerHTML).toBe(
    //     '<div></div><section></section>inner text 1<strong></strong>inner text 2 text 1 text 2'
    //   );
    // });

    // it('should replace multiple current nodes with an incoming array', () => {
    //   const parent = container();
    //   const context = createContext(false);
    //   const current = [
    //     document.createElement('div'),
    //     document.createElement('section'),
    //     document.createElement('span'),
    //   ];
    //   parent.append(...current);

    //   const toInsert = [
    //     document.createElement('span'),
    //     document.createElement('section'),
    //     document.createElement('div'),
    //   ];

    //   const result = insert(context, parent, toInsert, current);
    //   expect(parent.childNodes.length).toBe(toInsert.length);
    //   toInsert.forEach((element, i) => expect(element).toBe(result[i]));
    //   expect(parent.innerHTML).toBe(
    //     '<span></span><section></section><div></div>'
    //   );
    // });

    // it('should update multiple current text nodes with an incoming array', () => {
    //   const parent = container();
    //   const context = createContext(false);
    //   const current = [
    //     document.createTextNode('text 1'),
    //     document.createTextNode('text 2'),
    //     document.createTextNode('text 3'),
    //   ];
    //   parent.append(...current);

    //   const toInsert = [42, 'new text', null];

    //   const result: unknown[] = insert(context, parent, toInsert, current);
    //   expect(parent.childNodes.length).toBe(3);
    //   result.forEach((element, i) => expect(element).toBe(current[i]));
    //   expect(parent.innerHTML).toBe('42new text');
    // });

    // it('should append empty text node if incoming array is empty', () => {
    //   const parent = container();
    //   const context = createContext(false);
    //   const toInsert: any[] = [];

    //   const result = insert(context, parent, toInsert);
    //   expect(parent.childNodes.length).toBe(1);
    //   expect(result).toStrictEqual(document.createTextNode(''));
    //   expect(parent.innerHTML).toBe('');
    // });

    // it('should replace all current nodes with empty text node if the normalized array is empty', () => {
    //   const parent = container();
    //   const context = createContext(false);
    //   const current = [
    //     document.createTextNode('text'),
    //     document.createElement('div'),
    //   ];
    //   parent.append(...current);
    //   const toInsert: any[] = [];

    //   const result = insert(context, parent, toInsert, current);
    //   expect(parent.childNodes.length).toBe(1);
    //   expect(result).toStrictEqual(document.createTextNode(''));
    //   expect(parent.innerHTML).toBe('');
    // });

    // it('should remove the rest of the nodes if the incoming array length is lesser than current one', () => {
    //   const parent = container();
    //   const context = createContext(false);
    //   const current = [
    //     document.createTextNode('text'),
    //     document.createElement('div'),
    //     document.createElement('section'),
    //     document.createElement('span'),
    //     document.createElement('article'),
    //   ];
    //   parent.append(...current);

    //   const toInsert: any[] = ['new text', document.createElement('div')];

    //   const expectedResult = [
    //     document.createTextNode('new text'),
    //     document.createElement('div'),
    //   ];

    //   const result = insert(context, parent, toInsert, current);
    //   expect(parent.childNodes.length).toBe(2);
    //   expect(result).toStrictEqual(expectedResult);
    //   expect(parent.innerHTML).toBe('new text<div></div>');
    // });

    // it('should do nothing if the inserted element is unrecognized', () => {
    //   const parent = container();
    //   const context = createContext(false);
    //   insert(context, parent, {});
    //   expect(parent.childNodes.length).toBe(0);
    //   expect(parent.innerHTML).toBe('');
    // });
  });

  // TODO: move to integration tests
  // describe('reactive insert', () => {
  //   it('should append properties', () => {
  //     const context = createContext(false);
  //     const parent = container();
  //     const atom1 = Atom.new<string | number>(42);
  //     const atom2 = Atom.new<string | number>('text');

  //     insert(context, parent, atom1);
  //     insert(context, parent, atom2);
  //     expect(parent.childNodes.length).toBe(2);
  //     expect(parent.innerHTML).toBe('42text');
  //     expect(context.children?.size).toBe(2);

  //     atom1.set('new text');
  //     atom2.set(42);
  //     expect(parent.childNodes.length).toBe(2);
  //     expect(parent.innerHTML).toBe('new text42');
  //     expect(context.children?.size).toBe(2);
  //   });

  //   it('should append nested properties', () => {
  //     const context = createContext(false);
  //     const parent = container();
  //     const atom1 = Atom.new<string | number>(42);
  //     const atom2 = Atom.new<string | number>('text');
  //     const parentAtom = Atom.new(atom1);

  //     insert(context, parent, parentAtom);
  //     expect(parent.childNodes.length).toBe(1);
  //     expect(parent.innerHTML).toBe('42');
  //     expect(context.children?.size).toBe(1);

  //     atom1.set('atom1 subscribed');
  //     expect(parent.childNodes.length).toBe(1);
  //     expect(parent.innerHTML).toBe('atom1 subscribed');
  //     expect(context.children?.size).toBe(1);

  //     parentAtom.set(atom2);
  //     atom1.set('atom1 unsubscribed');
  //     expect(parent.childNodes.length).toBe(1);
  //     expect(parent.innerHTML).toBe('text');
  //     expect(context.children?.size).toBe(1);

  //     atom2.set('atom2 subscribed');
  //     expect(parent.childNodes.length).toBe(1);
  //     expect(parent.innerHTML).toBe('atom2 subscribed');
  //     expect(context.children?.size).toBe(1);
  //   });

  //   it('should append properties with arrays', () => {
  //     const context = createContext(false);
  //     const parent = container();
  //     const atom = Atom.new<(string | number)[]>([1, 2, 42]);

  //     insert(context, parent, atom);
  //     expect(parent.childNodes.length).toBe(3);
  //     expect(parent.innerHTML).toBe('1242');
  //     expect(context.children?.size).toBe(1);

  //     atom.set(['foo', 'bar']);
  //     expect(parent.childNodes.length).toBe(2);
  //     expect(parent.innerHTML).toBe('foobar');
  //     expect(context.children?.size).toBe(1);
  //   });

  //   // it('should append properties with arrays with properties', () => {
  //   //   const parent = container();
  //   //   const atomChild1 = Atom.new<(string | number)[]>(['child ', 'foo']);
  //   //   const atomChild2 = Atom.new<(string | number)[]>(['child ', 'bar']);
  //   //   const parentAtom = Atom.new(['text ', atomChild1, ' text ', atomChild2]);

  //   //   runInContext(newContext(), () => insert(context, parent, parentAtom), null)
  //   //   expect(parent.childNodes.length).toBe(6);
  //   //   expect(parent.innerHTML).toBe('text child foo text child bar');
  //   //   expect(atomChild1.observers).toBe(1);
  //   //   expect(atomChild2.observers).toBe(1);
  //   //   expect(parentAtom.observers).toBe(1);

  //   //   atomChild2.set(['bar ', 'child']);
  //   //   expect(parent.childNodes.length).toBe(6);
  //   //   expect(parent.innerHTML).toBe('text child foo text bar child');
  //   //   expect(atomChild1.observers).toBe(1);
  //   //   expect(atomChild2.observers).toBe(1);
  //   //   expect(parentAtom.observers).toBe(1);

  //   //   atomChild1.set(['foo ', 'child']);
  //   //   expect(parent.childNodes.length).toBe(6);
  //   //   expect(parent.innerHTML).toBe('text foo child text bar child');
  //   //   expect(atomChild1.observers).toBe(1);
  //   //   expect(atomChild2.observers).toBe(1);
  //   //   expect(parentAtom.observers).toBe(1);

  //   //   parentAtom.set(['text ', atomChild2]);
  //   //   expect(parent.childNodes.length).toBe(3);
  //   //   expect(parent.innerHTML).toBe('text bar child');
  //   //   expect(atomChild1.observers).toBe(0);
  //   //   expect(atomChild2.observers).toBe(1);
  //   //   expect(parentAtom.observers).toBe(1);
  //   // });
  // });
});
