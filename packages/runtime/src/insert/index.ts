import { type Property, isProperty, merge } from '@frp-dom/reactive-core';
import { createReactiveNode, Context } from '../core';

export type MountableElement = ParentNode;

export function insert(
  parentContext: Context,
  parentNode: MountableElement,
  value: any,
  current?: any,
  unwrap?: boolean
): any {
  let t,
    isCurrentArray = Array.isArray(current);

  while ((t = typeof value) === 'function') value = value(parentContext);

  switch (true) {
    case t === 'string' || t === 'number' || t === 'bigint' || t === 'symbol': {
      if (t !== 'string') value = value.toString();
      if (isCurrentArray) {
        return replaceChildrenWith(current, value);
      }

      return insertText(parentNode, current, value);
    }
    case value == null || t === 'boolean': {
      if (isCurrentArray) {
        return replaceChildrenWith(current);
      }

      return insertText(parentNode, current);
    }
    case isProperty(value): {
      createReactiveNode(parentContext, value, (newContext) => {
        current = insert(newContext, parentNode, value.get(), current);
      });
      return current;
    }
    case value[Symbol.iterator] != null: {
      const normalizedBuffer: Element[] = [];
      const reactiveBuffer = normalizeArray(
        parentContext,
        isCurrentArray ? current : current ? [current] : [],
        normalizedBuffer,
        value,
        unwrap
      );

      if (reactiveBuffer.length > 0) {
        createReactiveNode(
          parentContext,
          merge(reactiveBuffer),
          (newContext) =>
            (current = insert(
              newContext,
              parentNode,
              normalizedBuffer,
              current,
              true
            ))
        );
        return current;
      }

      if (normalizedBuffer.length === 0) {
        if (isCurrentArray) {
          return replaceChildrenWith(current);
        } else {
          return insertText(parentNode, current);
        }
      }

      if (current) {
        reconcileArrays(
          parentNode,
          isCurrentArray ? current : [current],
          normalizedBuffer
        );
      } else {
        parentNode.append.apply(parentNode, normalizedBuffer);
      }
      return normalizedBuffer;
    }
    case value.nodeType !== undefined: {
      if (isCurrentArray) {
        current = replaceChildrenWith(current, value);
      }

      if (current) {
        current.replaceWith(value);
      } else {
        parentNode.append(value);
      }
      return value;
    }
    default: {
      console.error(`WARNING: Unrecognized element`, value);
      return current;
    }
  }
}

function normalizeArray(
  context: Context,
  current: Node[],
  buffer: Array<Node | Property<unknown>>,
  value: any,
  unwrap = false,
  idx = 0,
  reactiveBuffer: Property<unknown>[] = []
) {
  let t;
  for (let item of value) {
    while ((t = typeof item) === 'function') item = item(context);

    if (t === 'boolean' || item == null) {
      idx++;
    } else if (t === 'object' && item.nodeType) {
      idx++;
      buffer.push(item);
    } else if (t !== 'string' && item[Symbol.iterator]) {
      normalizeArray(
        context,
        current,
        buffer,
        item,
        false,
        idx,
        reactiveBuffer
      );
    } else if (isProperty(item)) {
      if (unwrap) {
        item = item.get();
        normalizeArray(
          context,
          current,
          buffer,
          (t = typeof item) !== 'string' && item[Symbol.iterator]
            ? item
            : [item],
          false,
          idx,
          reactiveBuffer
        );
      } else {
        buffer.push(item);
        reactiveBuffer.push(item);
      }
      idx++;
    } else {
      if (t !== 'string') item = item.toString();

      const prev = current[idx];
      if (prev && prev.nodeType === 3 && (prev as Text).data === item) {
        buffer.push(prev);
      } else {
        buffer.push(document.createTextNode(item));
      }
      idx++;
    }
  }

  return reactiveBuffer;
}

function insertText(parentNode: MountableElement, current?: any, text = '') {
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

export function replaceChildrenWith(
  current: any[],
  replacement: any = '',
  isReplacementText = typeof replacement === 'string'
) {
  let insertion: Node | undefined;
  for (let idx = current.length - 1; idx >= 0; idx--) {
    const node = current[idx];
    if (node.nodeType === 3 && isReplacementText && !insertion) {
      if (node.data !== replacement) node.data = replacement;
      insertion = node;
    } else if (node === replacement && !insertion) {
      insertion = replacement;
    } else if (!idx && !insertion) {
      node.replaceWith(
        (insertion = isReplacementText
          ? document.createTextNode(replacement)
          : replacement)
      );
    } else {
      node.remove();
    }
  }

  return insertion;
}

function reconcileArrays(parentNode: Node, a: Element[], b: Element[]) {
  let bLength = b.length,
    aEnd = a.length,
    bEnd = bLength,
    aStart = 0,
    bStart = 0,
    after = a[aEnd - 1].nextSibling,
    map;

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
