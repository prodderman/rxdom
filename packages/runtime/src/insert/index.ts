import { isProperty } from '@frp-dom/reactive-core';
import { isEffectful } from '../effect';
import { createEffectfulNode, createReactiveNode, Context } from '../core';

export type MountableElement = ParentNode;

export function insert(
  context: Context,
  parent: MountableElement,
  child: any,
  current?: any
): any {
  return insertExpression(context, parent, child, current);
}

function insertExpression(
  context: Context,
  parentNode: MountableElement,
  child: any,
  current?: any
): any {
  let t,
    isCurrentArray = Array.isArray(current);

  while ((t = typeof child) === 'function') child = child(context);

  switch (true) {
    case t === 'string' || t === 'number' || t === 'bigint' || t === 'symbol': {
      if (t !== 'string') child = child.toString();
      if (isCurrentArray) {
        return replaceChildrenWith(parentNode, current, child);
      } else {
        return insertText(parentNode, current, child);
      }
    }
    case child == null || t === 'boolean': {
      if (isCurrentArray) {
        return replaceChildrenWith(parentNode, current);
      } else {
        return insertText(parentNode, current);
      }
    }
    case isProperty(child): {
      return createReactiveNode(context, child, (newContext) => {
        current = insertExpression(
          newContext,
          parentNode,
          child.get(),
          current
        );
      });
    }
    case isEffectful(child): {
      return createEffectfulNode(context, child[1], (newContext) =>
        insertExpression(newContext, parentNode, child[0], current)
      );
    }
    case Array.isArray(child): {
      // if (child.length > 0) {
      //   const array: Element[] = [];
      //   if (isCurrentArray) current = [current];
      //   insertArray(context, parentNode, array, child, current);
      //   if (isCurrentArray && array.length < current.length) {
      //     for (let idx = array.length; idx < current.length; idx++) {
      //       current[idx].remove();
      //     }
      //   }
      //   return array;
      // }
      // if (isCurrentArray) current = removeChildren(current);
      // return insertText(parentNode, current);
      return current;
    }
    case child.nodeType !== undefined: {
      if (isCurrentArray) {
        current = replaceChildrenWith(parentNode, current, child);
      }

      if (current) {
        current.replaceWith(child);
      } else {
        parentNode.append(child);
      }
      return child;
    }
    default: {
      console.error(`WARNING: Unrecognized element`, child);
      return current;
    }
  }
}

export function replaceChildrenWith(
  parentNode: MountableElement,
  current: any[],
  replacement: any = '',
  isReplacementText = typeof replacement === 'string',
  insertion?: Node
) {
  for (let idx = current.length - 1; idx >= 0; idx--) {
    const nodeOrArray = current[idx];

    if (Array.isArray(nodeOrArray)) {
      insertion = replaceChildrenWith(
        parentNode,
        nodeOrArray,
        replacement,
        isReplacementText,
        insertion
      );
    } else {
      if (nodeOrArray.nodeType == 3 && isReplacementText && !insertion) {
        nodeOrArray.data = replacement;
        insertion = nodeOrArray;
      } else if (nodeOrArray === replacement && !insertion) {
        insertion = replacement;
      } else if (!idx && !insertion) {
        nodeOrArray.replaceWith(
          (insertion = isReplacementText
            ? document.createTextNode(replacement)
            : replacement)
        );
      } else {
        nodeOrArray.remove();
      }
    }
  }

  return insertion;
}

function insertArray(
  context: Context,
  parentNode: MountableElement,
  buffer: any[],
  child: any[],
  current: any[],
  offset = 0,
  referenceNode = current[offset]
) {
  let currentIdx = offset,
    idx = 0;

  for (idx = 0; idx < child.length; idx++, currentIdx++) {
    let item = child[idx],
      prevItem = current[currentIdx],
      itemType;

    while ((itemType = typeof item) === 'function') item = item(context);

    if (item != null && item.nodeType) {
      if (prevItem) {
        if (item !== prevItem) prevItem.replaceWith((referenceNode = item));
      } else if (referenceNode) {
        referenceNode.after((referenceNode = item));
      } else {
        parentNode.append((referenceNode = item));
      }

      buffer.push(item);
    } else if (Array.isArray(item)) {
      const bufferLengthBefore = buffer.length;
      referenceNode = insertArray(
        context,
        parentNode,
        buffer,
        item,
        current,
        currentIdx,
        referenceNode
      );
      currentIdx += buffer.length - bufferLengthBefore;
    } else if (isProperty(item)) {
      // TODO: what to to?
    } else {
      item = itemType == 'boolean' || item == null ? '' : item.toString();
      if (prevItem) {
        if (prevItem.nodeType === 3) {
          if (prevItem.data !== item) prevItem.data = item;
          buffer.push(prevItem);
        } else {
          buffer.push((referenceNode = document.createTextNode(item)));
          prevItem.replaceWith(referenceNode);
        }
      } else {
        const textNode = document.createTextNode(item);
        buffer.push(textNode);
        if (referenceNode) {
          referenceNode.after(textNode, (referenceNode = textNode));
        } else {
          parentNode.append((referenceNode = textNode));
        }
      }
    }
  }

  return referenceNode;
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
