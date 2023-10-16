import { Atom } from '@frp-dom/data';

import { template } from '../template';
import { newContext, runInContext } from '../context';
import { insert } from './';

describe('runtime', () => {
  const container = template('<div></div>');

  describe('static insert', () => {
    it('should append strings, numbers, bigints and symbols', () => {
      const parent = container();
      runInContext(newContext(), () => insert(parent, 'text'), null);
      expect(parent.childNodes.length).toBe(1);
      expect(parent.innerHTML).toBe('text');

      runInContext(newContext(), () => insert(parent, BigInt(42)), null);
      expect(parent.childNodes.length).toBe(2);
      expect(parent.innerHTML).toBe('text42');

      runInContext(newContext(), () => insert(parent, 42), null);
      expect(parent.childNodes.length).toBe(3);
      expect(parent.innerHTML).toBe('text4242');

      runInContext(newContext(), () => insert(parent, Symbol(42)), null);
      expect(parent.childNodes.length).toBe(4);
      expect(parent.innerHTML).toBe('text4242Symbol(42)');
    });

    it('should replace a single node', () => {
      const parent = container();
      const current = document.createElement('div');
      parent.replaceChildren(current);

      runInContext(newContext(), () => insert(parent, 42, current), null);
      expect(parent.innerHTML).toBe('42');
      expect(parent.childNodes.length).toBe(1);
    });

    it(`should mutate the node's text if it's a text node`, () => {
      const parent = container();
      const current = document.createTextNode('text');
      parent.replaceChildren(current);

      runInContext(
        newContext(),
        () => {
          const result = insert(parent, 42, current);
          expect(parent.innerHTML).toBe('42');
          expect(current).toBe(result);
          expect(parent.firstChild).toBe(current);
          expect(parent.childNodes.length).toBe(1);
        },
        null
      );
    });

    it('should replace multiple nodes', () => {
      const parent = container();
      const current = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];
      parent.append(...current);

      runInContext(
        newContext(),
        () => {
          const result = insert(parent, 42, current);
          expect(parent.childNodes.length).toBe(1);
          expect(parent.firstChild).toBe(result);
          expect(parent.innerHTML).toBe('42');
        },
        null
      );
    });

    it(`should replace multiple nodes and mutate the first node's text if it is a text node`, () => {
      const parent = container();
      const current = [
        document.createTextNode('text'),
        document.createElement('div'),
        document.createElement('span'),
      ];
      parent.append(...current);
      expect(parent.innerHTML).toBe('text<div></div><span></span>');

      runInContext(
        newContext(),
        () => {
          const result = insert(parent, 42, current);
          expect(parent.childNodes.length).toBe(1);
          expect(result).toBe(current[0]);
          expect(parent.innerHTML).toBe('42');
        },
        null
      );
    });

    it('should append empty text node for null, undefined and boolean', () => {
      const parent = container();

      runInContext(newContext(), () => insert(parent, null), null);
      expect(parent.childNodes.length).toBe(1);
      expect(parent.innerHTML).toBe('');

      runInContext(newContext(), () => insert(parent, undefined), null);
      expect(parent.childNodes.length).toBe(2);
      expect(parent.innerHTML).toBe('');

      runInContext(newContext(), () => insert(parent, true), null);
      expect(parent.childNodes.length).toBe(3);
      expect(parent.innerHTML).toBe('');

      runInContext(newContext(), () => insert(parent, false), null);
      expect(parent.childNodes.length).toBe(4);
      expect(parent.innerHTML).toBe('');
    });

    it('should replace all previous nodes with empty text node for null, undefined and boolean', () => {
      const parent = container();
      const current = [
        document.createTextNode('text'),
        document.createElement('div'),
        document.createElement('span'),
      ];
      parent.append(...current);
      runInContext(
        newContext(),
        () => {
          const result = insert(parent, null, current);
          expect(parent.childNodes.length).toBe(1);
          expect(result).toBe(current[0]);
          expect(parent.innerHTML).toBe('');
        },
        null
      );
    });

    it('should append nodes', () => {
      const context = newContext();
      const parent = container();

      runInContext(
        context,
        () => {
          const node1 = document.createElement('div');
          const result1 = insert(parent, node1);
          expect(parent.childNodes.length).toBe(1);
          expect(parent.firstChild).toBe(node1);
          expect(result1).toBe(node1);
          expect(parent.innerHTML).toBe('<div></div>');
        },
        null
      );

      runInContext(
        context,
        () => {
          const node2 = document.createElement('span');
          const result2 = insert(parent, node2);
          expect(parent.childNodes.length).toBe(2);
          expect(parent.firstChild?.nextSibling).toBe(node2);
          expect(result2).toBe(node2);
          expect(parent.innerHTML).toBe('<div></div><span></span>');
        },
        null
      );
    });

    it('should replace current node', () => {
      const parent = container();
      const current = document.createElement('div');
      parent.append(current);

      const newNode = document.createElement('span');

      runInContext(
        newContext(),
        () => {
          const result = insert(parent, newNode, current);
          expect(parent.childNodes.length).toBe(1);
          expect(result).toBe(newNode);
          expect(parent.innerHTML).toBe('<span></span>');
        },
        null
      );
    });

    it('should append multiple nodes', () => {
      const parent = container();

      const toInsert1 = [
        42,
        document.createElement('div'),
        document.createElement('span'),
      ];

      runInContext(newContext(), () => insert(parent, toInsert1), null);
      expect(parent.childNodes.length).toBe(3);
      expect(parent.innerHTML).toBe('42<div></div><span></span>');

      const toInsert2 = [document.createElement('section'), 'text'];

      runInContext(newContext(), () => insert(parent, toInsert2), null);
      expect(parent.childNodes.length).toBe(5);
      expect(parent.innerHTML).toBe(
        '42<div></div><span></span><section></section>text'
      );
    });

    it('should replace multiple nodes', () => {
      const parent = container();
      const current = [
        document.createTextNode('text'),
        document.createElement('div'),
        document.createElement('span'),
      ];
      parent.append(...current);
      expect(parent.innerHTML).toBe('text<div></div><span></span>');

      const newNode = document.createElement('section');

      runInContext(
        newContext(),
        () => {
          const result = insert(parent, newNode, current);
          expect(parent.childNodes.length).toBe(1);
          expect(result).toBe(newNode);
          expect(parent.innerHTML).toBe('<section></section>');
        },
        null
      );
    });

    it('should normalize and append arrays', () => {
      const context = newContext();
      const parent = container();
      const toInsert1 = [
        true,
        document.createElement('div'),
        [document.createElement('section'), '-inner text 1'],
        '-text 1',
        null,
        '-text 2',
      ];

      const toInsert2 = [
        false,
        document.createElement('span'),
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

      runInContext(
        context,
        () => {
          const result1 = insert(parent, toInsert1);
          expect(parent.childNodes.length).toBe(expectedNResult1.length);
          expect(result1).toStrictEqual(expectedNResult1);
          expect(parent.innerHTML).toBe(
            '<div></div><section></section>-inner text 1-text 1-text 2'
          );
        },
        null
      );

      const expectedNResult2 = [
        document.createElement('span'),
        document.createElement('strong'),
        document.createTextNode('-inner text 2'),
        document.createTextNode('42'),
        document.createTextNode('42'),
      ];

      runInContext(
        context,
        () => {
          const result2 = insert(parent, toInsert2);
          expect(parent.childNodes.length).toBe(
            expectedNResult1.length + expectedNResult2.length
          );
          expect(result2).toStrictEqual(expectedNResult2);
          expect(parent.innerHTML).toBe(
            '<div></div><section></section>-inner text 1-text 1-text 2<span></span><strong></strong>-inner text 24242'
          );
        },
        null
      );
    });

    it('should normalize and replace current node with an incoming array', () => {
      const parent = container();
      const current = document.createElement('div');
      parent.append(current);
      const toInsert = [
        true,
        document.createElement('div'),
        [document.createElement('section'), '-inner text 1'],
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

      runInContext(
        newContext(),
        () => {
          const result = insert(parent, toInsert, current);
          expect(parent.childNodes.length).toBe(expectedNResult.length);
          expect(result).toStrictEqual(expectedNResult);
          expect(parent.innerHTML).toBe(
            '<div></div><section></section>-inner text 1<strong></strong>-inner text 2-text 1-text 2'
          );
        },
        null
      );
    });

    it('should normalize and replace multiple current nodes with an incoming array', () => {
      const parent = container();
      const current = [
        document.createElement('div'),
        document.createElement('section'),
        document.createElement('span'),
      ];
      parent.append(...current);

      const toInsert = [
        document.createElement('span'),
        document.createElement('section'),
        document.createElement('div'),
      ];

      runInContext(
        newContext(),
        () => {
          const result = insert(parent, toInsert, current);
          expect(parent.childNodes.length).toBe(toInsert.length);
          toInsert.forEach((element, i) => expect(element).toBe(result[i]));
          expect(parent.innerHTML).toBe(
            '<span></span><section></section><div></div>'
          );
        },
        null
      );
    });

    it('should normalize and mutate multiple current text nodes with an incoming array', () => {
      const parent = container();
      const current = [
        document.createTextNode('text 1'),
        document.createTextNode('text 2'),
        document.createTextNode('text 3'),
      ];
      parent.append(...current);

      const toInsert = [42, 'new text', null];

      runInContext(
        newContext(),
        () => {
          const result: unknown[] = insert(parent, toInsert, current);
          expect(parent.childNodes.length).toBe(2);
          result.forEach((element, i) => expect(element).toBe(current[i]));
          expect(parent.innerHTML).toBe('42new text');
        },
        null
      );
    });

    it('should append empty text node if the normalized array is empty', () => {
      const parent = container();
      const toInsert = [
        true,
        false,
        null,
        undefined,
        '',
        [null, undefined, true, false],
      ];
      runInContext(
        newContext(),
        () => {
          const result = insert(parent, toInsert);
          expect(parent.childNodes.length).toBe(1);
          expect(result).toStrictEqual(document.createTextNode(''));
          expect(parent.innerHTML).toBe('');
        },
        null
      );
    });

    it('should replace all current nodes with empty text node if the normalized array is empty', () => {
      const parent = container();
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
        [null, undefined, true, false],
      ];

      runInContext(
        newContext(),
        () => {
          const result = insert(parent, toInsert, current);
          expect(parent.childNodes.length).toBe(1);
          expect(result).toStrictEqual(document.createTextNode(''));
          expect(parent.innerHTML).toBe('');
        },
        null
      );
    });

    it('should do nothing if the inserted element is unrecognized', () => {
      const parent = container();
      runInContext(newContext(), () => insert(parent, {}), null);
      expect(parent.childNodes.length).toBe(0);
      expect(parent.innerHTML).toBe('');
    });
  });

  describe('reactive insert', () => {
    it('should append properties', () => {
      const context = newContext();
      const parent = container();
      const atom1 = Atom.new<string | number>(42);
      const atom2 = Atom.new<string | number>('text');

      runInContext(context, () => insert(parent, atom1), null);
      runInContext(context, () => insert(parent, atom2), null);
      expect(parent.childNodes.length).toBe(2);
      expect(parent.innerHTML).toBe('42text');
      expect(atom1.meta.observers).toBe(1);
      expect(atom2.meta.observers).toBe(1);
      expect(context.subscriptions.size).toBe(2);

      atom1.set('new text');
      atom2.set(42);
      expect(parent.childNodes.length).toBe(2);
      expect(parent.innerHTML).toBe('new text42');
      expect(atom1.meta.observers).toBe(1);
      expect(atom2.meta.observers).toBe(1);
      expect(context.subscriptions.size).toBe(2);
    });

    it('should append nested properties', () => {
      const context = newContext();
      const parent = container();
      const atom1 = Atom.new<string | number>(42);
      const atom2 = Atom.new<string | number>('text');
      const parentAtom = Atom.new(atom1);

      runInContext(context, () => insert(parent, parentAtom), null);
      expect(parent.childNodes.length).toBe(1);
      expect(parent.innerHTML).toBe('42');
      expect(parentAtom.meta.observers).toBe(1);
      expect(atom1.meta.observers).toBe(1);
      expect(atom2.meta.observers).toBe(0);
      expect(context.subscriptions.size).toBe(1);

      atom1.set('atom1 subscribed');
      expect(parent.childNodes.length).toBe(1);
      expect(parent.innerHTML).toBe('atom1 subscribed');
      expect(parentAtom.meta.observers).toBe(1);
      expect(atom1.meta.observers).toBe(1);
      expect(atom2.meta.observers).toBe(0);
      expect(context.subscriptions.size).toBe(1);

      parentAtom.set(atom2);
      atom1.set('atom1 unsubscribed');
      expect(parent.childNodes.length).toBe(1);
      expect(parent.innerHTML).toBe('text');
      expect(parentAtom.meta.observers).toBe(1);
      expect(atom1.meta.observers).toBe(0);
      expect(atom2.meta.observers).toBe(1);
      expect(context.subscriptions.size).toBe(1);

      atom2.set('atom2 subscribed');
      expect(parent.childNodes.length).toBe(1);
      expect(parent.innerHTML).toBe('atom2 subscribed');
      expect(parentAtom.meta.observers).toBe(1);
      expect(atom1.meta.observers).toBe(0);
      expect(atom2.meta.observers).toBe(1);
      expect(context.subscriptions.size).toBe(1);
    });

    it('should append properties with arrays', () => {
      const context = newContext();
      const parent = container();
      const atom = Atom.new<(string | number)[]>([1, 2, 42]);

      runInContext(context, () => insert(parent, atom), null);
      expect(parent.childNodes.length).toBe(3);
      expect(parent.innerHTML).toBe('1242');
      expect(atom.meta.observers).toBe(1);
      expect(context.subscriptions.size).toBe(1);

      atom.set(['foo', 'bar']);
      expect(parent.childNodes.length).toBe(2);
      expect(parent.innerHTML).toBe('foobar');
      expect(atom.meta.observers).toBe(1);
      expect(context.subscriptions.size).toBe(1);
    });

    // it('should append properties with arrays with properties', () => {
    //   const parent = container();
    //   const atomChild1 = Atom.new<(string | number)[]>(['child ', 'foo']);
    //   const atomChild2 = Atom.new<(string | number)[]>(['child ', 'bar']);
    //   const parentAtom = Atom.new(['text ', atomChild1, ' text ', atomChild2]);

    //   runInContext(newContext(), () => insert(parent, parentAtom), null)
    //   expect(parent.childNodes.length).toBe(6);
    //   expect(parent.innerHTML).toBe('text child foo text child bar');
    //   expect(atomChild1.meta.observers).toBe(1);
    //   expect(atomChild2.meta.observers).toBe(1);
    //   expect(parentAtom.meta.observers).toBe(1);

    //   atomChild2.set(['bar ', 'child']);
    //   expect(parent.childNodes.length).toBe(6);
    //   expect(parent.innerHTML).toBe('text child foo text bar child');
    //   expect(atomChild1.meta.observers).toBe(1);
    //   expect(atomChild2.meta.observers).toBe(1);
    //   expect(parentAtom.meta.observers).toBe(1);

    //   atomChild1.set(['foo ', 'child']);
    //   expect(parent.childNodes.length).toBe(6);
    //   expect(parent.innerHTML).toBe('text foo child text bar child');
    //   expect(atomChild1.meta.observers).toBe(1);
    //   expect(atomChild2.meta.observers).toBe(1);
    //   expect(parentAtom.meta.observers).toBe(1);

    //   parentAtom.set(['text ', atomChild2]);
    //   expect(parent.childNodes.length).toBe(3);
    //   expect(parent.innerHTML).toBe('text bar child');
    //   expect(atomChild1.meta.observers).toBe(0);
    //   expect(atomChild2.meta.observers).toBe(1);
    //   expect(parentAtom.meta.observers).toBe(1);
    // });
  });
});
