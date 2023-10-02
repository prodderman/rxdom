/* eslint-disable */
import { Property, type Observer, type Subscription } from '@frp-dom/data';
import type { JSX } from './jsx-runtime/jsx';

export type MountableElement = ParentNode;

export interface Context {
  subscriptions: Set<Subscription>;
}

export function newContext(): Context {
  return {
    subscriptions: new Set(),
  };
}

export function insert(
  ctx: Context,
  parent: MountableElement,
  child: any,
  current?: any
): any {
  return insertExpression(ctx, parent, child, current);
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

export function render(tree: JSX.Element, element: Element): () => void {
  const context = newContext();
  insert(context, element, typeof tree === 'function' ? tree(context) : tree);

  return () => {
    for (const subscription of context.subscriptions)
      subscription.unsubscribe();
    context.subscriptions.clear();
    element.innerHTML = '';
  };
}

export function template(html: string, isSVG: boolean) {
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

  return () => (node ??= create()).cloneNode(true);
}

/**
 *
 * @param {ParentNode} parentNode Node into which the 'child' will be inserted
 * @param {Any} child Any content that will be placed inside the 'parent'
 * @param {Node | Node[] | null | undefined} current
 */

function insertExpression(
  context: Context,
  parentNode: MountableElement,
  child: any,
  current?: any
) {
  const t = typeof child,
    isCurrentArray = current && Array.isArray(current);
  if (t === 'string' || t === 'number' || t === 'bigint' || t === 'symbol') {
    if (t !== 'string') child = child.toString();
    isCurrentArray && (current = cleanChildren(current));
    current = insertText(parentNode, current, child);
  } else if (child == null || t === 'boolean') {
    isCurrentArray && (current = cleanChildren(current));
    current = insertText(parentNode, current);
  } else if (t === 'function') {
    while (typeof child === 'function') child = child(context);
    current = insertExpression(context, parentNode, child, current);
  } else if (Property.is(child)) {
    bindProperty(
      context,
      child,
      (newContext, value) =>
        (current = insertExpression(newContext, parentNode, value, current))
    );
  } else if (Array.isArray(child)) {
    const array: Element[] = [];
    normalizeIncomingArray(context, parentNode, array, child, current);

    if (array.length === 0) {
      isCurrentArray && (current = cleanChildren(current));
      current = insertText(parentNode, current);
    } else {
      if (isCurrentArray) {
        reconcileArrays(parentNode, current, array);
      } else if (current) {
        current.replaceWith.apply(current, array);
      } else {
        parentNode.append.apply(parentNode, array);
      }
      current = array;
    }
  } else if (child.nodeType) {
    isCurrentArray && (current = cleanChildren(current));

    if (current) {
      current.replaceWith(child);
    } else {
      parentNode.append(child);
    }
    current = child;
  } else {
    console.warn(`Unrecognized child`, child);
  }

  return current;
}

function normalizeIncomingArray(
  context: Context,
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
      normalizeIncomingArray(context, parentNode, buffer, item, prev);
    } else if (Property.is(item)) {
      const chunkStart = buffer.length;
      let prevChunkLength = 0;
      let prevInsertion: any = undefined;
      bindProperty(context, item, (newContext, newValue) => {
        prevInsertion = insertExpression(
          newContext,
          parentNode,
          newValue,
          prevInsertion
        );
        buffer.splice(
          chunkStart,
          prevChunkLength,
          ...(Array.isArray(prevInsertion) ? prevInsertion : [prevInsertion])
        );
        prevChunkLength = Array.isArray(prevInsertion)
          ? prevInsertion.length
          : 1;
      });
    } else if (t === 'function') {
      while (typeof item === 'function') item = item(context);
      normalizeIncomingArray(
        context,
        parentNode,
        buffer,
        Array.isArray(item) ? item : [item],
        Array.isArray(prev) ? prev : [prev]
      );
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

function bindProperty(
  parentContext: Context,
  child: Property<any>,
  effect: (context: Context, value: any) => any
) {
  const thisContext = newContext();
  const dispose = () => {
    console.log(child.name);
    if (thisContext.subscriptions.size > 0) {
      for (const subscription of thisContext.subscriptions)
        subscription.unsubscribe();
      thisContext.subscriptions.clear();
    }
  };

  const observer: Observer<any> = {
    next: (value) => {
      effect(thisContext, value);
      return dispose;
    },
  };

  const thisSubscription = child.subscribe(observer);
  parentContext.subscriptions.add(thisSubscription);

  effect(thisContext, child.get());
}

/* eslint-disable */

export function reconcileArrays(parentNode: Node, a: Element[], b: Element[]) {
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
