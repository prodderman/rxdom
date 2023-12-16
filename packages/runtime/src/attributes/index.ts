import { Property, isProperty } from '@frp-dom/reactive-core';
import { Context, insertReactiveNode } from '../core';

export function spreadAttributes(
  context: Context,
  node: HTMLElement,
  properties: Record<string, any>
) {
  for (const key in properties) {
    if (key === 'style') {
      setStyle(context, node, properties[key]);
    } else if (key === 'class') {
      setClass(context, node, properties[key]);
    } else if (key === 'value' && 'value' in node) {
      setValue(context, node as HTMLInputElement, properties[key]);
    } else if (key.startsWith('on') || key.startsWith('capture:on')) {
      const capture = key.startsWith('capture');
      const eventName = capture ? key.slice(10) : key.slice(2);
      setEventListener(
        context,
        node,
        eventName.toLowerCase(),
        properties[key],
        capture
      );
    } else {
      setAttribute(context, node, key, properties[key]);
    }
  }
}

export function setAttribute(
  context: Context,
  node: Element,
  key: string,
  value: any
) {
  if (!isProperty(value)) {
    if (value == null) {
      node.removeAttribute(key);
    } else if (typeof value === 'boolean') {
      node.toggleAttribute(key, value);
    } else {
      node.setAttribute(key, value);
    }
  } else {
    insertReactiveNode(context, value, void 0, (newContext) =>
      setAttribute(newContext, node, key, value.get())
    );
  }
}

export function setValue(context: Context, node: HTMLInputElement, value: any) {
  if (!isProperty(value)) {
    if (value == null) {
      node.value = '';
    } else {
      node.value = value;
    }
  } else {
    insertReactiveNode(context, value, void 0, (newContext) =>
      setValue(newContext, node, value.get())
    );
  }
}

export function setStyle(
  context: Context,
  node: HTMLElement,
  value: any,
  current?: any
): any {
  while (typeof current === 'function') current = current();

  const nodeStyle = node.style;
  if (isProperty(value)) {
    return insertReactiveNode(
      context,
      value,
      current,
      (newContext, newResult) =>
        setStyle(newContext, node, value.get(), newResult)
    );
  }

  if (typeof value === 'object') {
    if (typeof current === 'object') {
      for (const name in current) {
        if (!value[name]) {
          nodeStyle.removeProperty(name);
          delete current[name];
        }
      }
    }

    for (const name in value) {
      setStyleProperty(context, nodeStyle, name, value[name], (current ??= {}));
    }

    return current;
  }

  if (value == null) return node.removeAttribute('style');
  return (nodeStyle.cssText = value);
}

function setStyleProperty(
  context: Context,
  css: CSSStyleDeclaration,
  name: string,
  value: any,
  current: any
) {
  if (!isProperty(value)) {
    if (value == null) {
      css.removeProperty(name);
      delete current[name];
    } else {
      css.setProperty(name, value);
      current[name] = value;
    }
  } else {
    insertReactiveNode(context, value, void 0, (newContext) =>
      setStyleProperty(newContext, css, name, value.get(), current)
    );
  }
}

export function setClass(context: Context, node: Element, value: any) {
  // TODO: set class more precise
  if (!isProperty(value)) {
    if (value == null) node.removeAttribute('class');
    else node.className = value;
  } else {
    insertReactiveNode(context, value, void 0, (newContext) =>
      setClass(newContext, node, value.get())
    );
  }
}

export function setEventListener(
  context: Context | undefined,
  node: Node,
  name: string,
  handler:
    | EventListenerOrEventListenerObject
    | Property<EventListenerOrEventListenerObject>,
  capture: boolean,
  prevHandler?: EventListenerOrEventListenerObject
): any {
  if (!isProperty(handler)) {
    if (handler !== prevHandler) {
      prevHandler && node.removeEventListener(name, prevHandler);
      node.addEventListener(name, (prevHandler = handler), capture);
    }
  } else {
    return insertReactiveNode(
      context!,
      handler,
      prevHandler,
      (newContext, newHandler) =>
        setEventListener(
          newContext,
          node,
          name,
          handler.get(),
          capture,
          newHandler
        )
    );
  }

  return prevHandler;
}
