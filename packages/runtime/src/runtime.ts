/* eslint-disable */
import {
  isProperty,
  type Property,
  type Observer,
} from '@frp-dom/reactive-core';
import type { JSX } from './jsx-runtime/jsx';
import {
  getCurrentContext,
  newContext,
  runInContext,
  freeContext,
} from './context';

export type MountableElement = ParentNode;

export function render(tree: () => JSX.Element, element: Element): () => void {
  const rootContext = newContext();
  runInContext(rootContext, () => insert(element, tree()), null);

  return () => {
    for (const subscription of rootContext.subscriptions)
      subscription.unsubscribe();
    freeContext();
    element.innerHTML = '';
  };
}

export function insert(
  parent: MountableElement,
  child: any,
  current?: any
): any {
  return insertExpression(parent, child, current);
}

export function className() {}

export function addEventListener(
  node: Node,
  name: string,
  handler: EventListenerOrEventListenerObject
) {
  node.addEventListener(name, handler);
}

export function createComponent(Comp: (props: any) => any, props: any): any {
  return Comp(props);
}

export function template(html: string, isSVG = false): () => Element {
  let node: Node;
  const create = () => {
    const t = document.createElement('template');
    t.innerHTML = html;
    const node = isSVG
      ? t.content.firstChild!.firstChild
      : t.content.firstChild;

    if (!node) {
      throw Error(`Invalid html ${html}`);
    }

    return node;
  };

  return () => (node ??= create()).cloneNode(true) as Element;
}

/**
 *
 * @param {ParentNode} parentNode Node into which the 'child' will be inserted
 * @param {Any} child Any content that will be placed inside the 'parent'
 * @param {Node | Node[] | null | undefined} current
 */

function insertExpression(
  parentNode: MountableElement,
  child: any,
  current?: any
): any {
  const t = typeof child,
    isCurrentArray = current && Array.isArray(current);

  switch (true) {
    case t === 'string' || t === 'number' || t === 'bigint' || t === 'symbol': {
      if (t !== 'string') child = child.toString();

      if (isCurrentArray) current = cleanChildren(current);
      return insertText(parentNode, current, child);
    }
    case child == null || t === 'boolean': {
      if (isCurrentArray) current = cleanChildren(current);
      return insertText(parentNode, current);
    }
    case isProperty(child): {
      bindProperty(
        child,
        () => (current = insertExpression(parentNode, child.get(), current))
      );

      return current;
    }
    case Array.isArray(child): {
      const array: Element[] = [];
      normalizeIncomingArray(parentNode, array, child, current);

      if (array.length === 0) {
        isCurrentArray && (current = cleanChildren(current));
        return insertText(parentNode, current);
      }

      if (isCurrentArray) {
        reconcileArrays(parentNode, current, array);
      } else if (current) {
        current.replaceWith.apply(current, array);
      } else {
        parentNode.append.apply(parentNode, array);
      }

      return array;
    }
    case child.nodeType !== undefined: {
      if (isCurrentArray) {
        current = cleanChildren(current);
      }

      if (current) {
        current.replaceWith(child);
      } else {
        parentNode.append(child);
      }
      return child;
    }
    default: {
      console.warn(`Unrecognized child`, child);
      return current;
    }
  }
}

function normalizeIncomingArray(
  parentNode: MountableElement,
  buffer: any[],
  child: any[],
  current: any
) {
  for (let idx = 0; idx < child.length; idx++) {
    let item = child[idx],
      prev = current && current[idx],
      t;

    if (item === '' || item == null || (t = typeof item) == 'boolean') {
    } else if (item.nodeType) {
      buffer.push(item);
    } else if (Array.isArray(item)) {
      normalizeIncomingArray(parentNode, buffer, item, prev);
    } else if (isProperty(item)) {
      // TODO: works incorrectly
      const chunkStart = buffer.length;
      let prevChunkLength = 0;
      let prevInsertion: any = undefined;
      bindProperty(item, () => {
        prevInsertion = insertExpression(parentNode, item.get(), prevInsertion);
        buffer.splice(
          chunkStart,
          prevChunkLength,
          ...(Array.isArray(prevInsertion) ? prevInsertion : [prevInsertion])
        );
        prevChunkLength = Array.isArray(prevInsertion)
          ? prevInsertion.length
          : 1;
      });
    } else {
      if (t !== 'string') item = item.toString();
      if (prev && prev.nodeType === 3) {
        if (prev.data !== item) prev.data = item;
        buffer.push(prev);
      } else {
        buffer.push(document.createTextNode(item));
      }
    }
  }
}

function cleanChildren(current: any[]) {
  if (current.length > 1) {
    for (let i = 1; i < current.length; i++) current[i].remove();
  }
  return current[0];
}

function insertText(
  parentNode: MountableElement,
  current?: any,
  text: string = ''
) {
  if (current) {
    if (current.nodeType === 3) {
      current.data = text;
    } else {
      current.replaceWith((current = document.createTextNode(text)));
    }
  } else {
    parentNode.append((current = document.createTextNode(text)));
  }

  return current;
}

function bindProperty(child: Property<any>, effect: () => void) {
  const parentContext = getCurrentContext();
  const thisContext = newContext();

  const dispose = () => {
    if (thisContext.subscriptions.size > 0) {
      for (const subscription of thisContext.subscriptions)
        subscription.unsubscribe();
      thisContext.subscriptions.clear();
    }
  };

  let tickImmediately = false;
  const observer: Observer<any> = {
    next: () => {
      tickImmediately = true;
      dispose();
      runInContext(thisContext, effect, parentContext);
    },
  };

  const thisSubscription = child.subscribe(observer);
  thisSubscription.add(dispose);
  parentContext.subscriptions.add(thisSubscription);

  if (!tickImmediately) {
    runInContext(thisContext, effect, parentContext);
  }
}

function reconcileArrays(parentNode: Node, a: Element[], b: Element[]) {
  let bLength = b.length,
    aEnd = a.length,
    bEnd = bLength,
    aStart = 0,
    bStart = 0,
    after = a[aEnd - 1].nextSibling,
    map = null;

  while (aStart < aEnd || bStart < bEnd) {
    // common prefix
    if (a[aStart] === b[bStart]) {
      aStart++;
      bStart++;
      continue;
    }
    // common suffix
    while (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--;
      bEnd--;
    }
    // append
    if (aEnd === aStart) {
      const node =
        bEnd < bLength
          ? bStart
            ? b[bStart - 1].nextSibling
            : b[bEnd - bStart]
          : after;

      while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node);
      // remove
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart])) a[aStart].remove();
        aStart++;
      }
      // swap backward
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = a[--aEnd].nextSibling;
      parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
      parentNode.insertBefore(b[--bEnd], node);

      a[aEnd] = b[bEnd];
      // fallback to map
    } else {
      if (!map) {
        map = new Map();
        let i = bStart;

        while (i < bEnd) map.set(b[i], i++);
      }

      const index = map.get(a[aStart]);
      if (index != null) {
        if (bStart < index && index < bEnd) {
          let i = aStart,
            sequence = 1,
            t;

          while (++i < aEnd && i < bEnd) {
            if ((t = map.get(a[i])) == null || t !== index + sequence) break;
            sequence++;
          }

          if (sequence > index - bStart) {
            const node = a[aStart];
            while (bStart < index) parentNode.insertBefore(b[bStart++], node);
          } else parentNode.replaceChild(b[bStart++], a[aStart++]);
        } else aStart++;
      } else a[aStart++].remove();
    }
  }
}
