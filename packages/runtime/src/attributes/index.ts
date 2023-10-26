import { Property, isProperty } from '@frp-dom/reactive-core';
import { bindProperty } from '../bind';

export function spreadAttributes(
  node: HTMLElement,
  properties: Record<string, any>
) {
  for (const key in properties) {
    if (key === 'style') {
      setStyle(node, properties[key]);
    } else if (key === 'class') {
      setClass(node, properties[key]);
    } else if (key === 'value' && 'value' in node) {
      setValue(node as HTMLInputElement, properties[key]);
    } else if (key.startsWith('on') || key.startsWith('capture:on')) {
      const capture = key.startsWith('capture');
      const eventName = capture ? key.slice(10) : key.slice(2);
      setEventListener(node, eventName.toLowerCase(), properties[key], capture);
    } else {
      setAttribute(node, key, properties[key]);
    }
  }
}

export function setAttribute(node: Element, key: string, value: any) {
  if (!isProperty(value)) {
    if (value == null) {
      node.removeAttribute(key);
    } else if (typeof value === 'boolean') {
      node.toggleAttribute(key, value);
    } else {
      node.setAttribute(key, value);
    }
  } else {
    bindProperty(value, () => setAttribute(node, key, value.get()));
  }
}

export function setValue(node: HTMLInputElement, value: any) {
  if (!isProperty(value)) {
    if (value == null) {
      node.value = '';
    } else {
      node.value = value;
    }
  } else {
    bindProperty(value, () => setValue(node, value.get()));
  }
}

export function setStyle(node: HTMLElement, value: any, current?: any) {
  const nodeStyle = node.style;
  if (isProperty(value)) {
    bindProperty(value, () => (current = setStyle(node, value.get(), current)));
    return current;
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
      setStyleProperty(nodeStyle, name, value[name], (current ??= {}));
    }

    return current;
  }

  if (value == null) return node.removeAttribute('style');
  return (nodeStyle.cssText = value);
}

function setStyleProperty(
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
    bindProperty(value, () =>
      setStyleProperty(css, name, value.get(), current)
    );
  }
}

export function setClass(node: Element, value: any) {
  // TODO: set class more precise
  if (!isProperty(value)) {
    if (value == null) node.removeAttribute('class');
    else node.className = value;
  } else {
    bindProperty(value, () => setClass(node, value.get()));
  }
}

export function setEventListener(
  node: Node,
  name: string,
  handler:
    | EventListenerOrEventListenerObject
    | Property<EventListenerOrEventListenerObject>,
  capture: boolean,
  prevHandler?: EventListenerOrEventListenerObject
) {
  if (!isProperty(handler)) {
    if (handler !== prevHandler) {
      prevHandler && node.removeEventListener(name, prevHandler);
      node.addEventListener(name, (prevHandler = handler), capture);
    }
  } else {
    bindProperty(
      handler,
      () =>
        (prevHandler = setEventListener(
          node,
          name,
          handler.get(),
          capture,
          prevHandler
        ))
    );
  }

  return prevHandler;
}
