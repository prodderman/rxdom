import { isProperty, Property } from '@frp-dom/signals';

export type MountableElement =
  | Element
  | Document
  | ShadowRoot
  | DocumentFragment
  | Node;

export function spread(
  node: Element,
  accessor: any,
  isSVG?: boolean,
  skipChildren?: boolean
): void {}

export function assign(
  node: Element,
  props: any,
  isSVG?: boolean,
  skipChildren?: boolean
): void {}

export function dynamicProperty(props: any, key: string): any {}

export const SVGElements = new Set<string>();

export function insert(
  parent: MountableElement,
  child: any,
  marker?: ChildNode | null,
  buffer?: any
): any {
  if (marker !== undefined && !buffer) buffer = [];
  return insertExpression(parent, child, marker, buffer);
}

export function className() {}

export function createComponent(Comp: (props: any) => any, props: any): any {
  return Comp(props);
}

export function template(html: string, check: number, isSVG?: boolean) {
  const template = document.createElement('template');
  template.innerHTML = html;
  if ('_DX_DEV_' && check && template.innerHTML.split('<').length - 1 !== check)
    throw `The browser resolved template HTML does not match JSX input:\n${template.innerHTML}\n\n${html}. Is your HTML properly formed?`;
  let node = template.content.firstChild;
  if (isSVG) node = node.firstChild;
  return node;
}

/**
 *
 * @param {Node} parent Node into which the 'child' will be append
 * @param {Any} child Any content that will be placed inside the 'parent'
 * @param {ChildNode | null} marker The place where the Atom/Property will be placed
 */

function insertExpression(
  parent: Node,
  child: any,
  marker?: ChildNode | null,
  buffer?: any
): any {
  if (child === buffer) return buffer;

  const t = typeof child,
    multi = marker !== undefined;
  parent = (multi && buffer[0] && buffer[0].parentNode) || parent;

  if (isProperty(child)) {
    wrap(
      (value) => (buffer = insertExpression(parent, value, marker, buffer)),
      child
    );
  } else if (
    t === 'string' ||
    t === 'number' ||
    t === 'bigint' ||
    t === 'symbol'
  ) {
    child = child.toString();
    if (multi) {
      let node = buffer[0];
      if (node && node.nodeType === 3) {
        node.data = child;
      } else node = document.createTextNode(child);
      buffer = cleanChildren(parent, marker, buffer, node);
    } else {
      if (buffer !== '' && typeof buffer === 'string') {
        buffer = (parent.firstChild as Text).data = child;
      } else buffer = parent.textContent = child;
    }
  } else if (child == undefined || child == null || t === 'boolean') {
    buffer = cleanChildren(parent, marker, buffer);
  } else if (t === 'function') {
    buffer = insertExpression(parent, child(), marker, buffer);
  } else if (Array.isArray(child)) {
    // const array = normalizeIncomingArray([], child);
    // if (config.hydrate && config.hydrate.registry) return buffer;
    // if (array.length === 0) {
    //   buffer = cleanChildren(parent, buffer, marker);
    //   if (multi) return buffer;
    // } else {
    //   if (Array.isArray(buffer)) {
    //     if (buffer.length === 0) {
    //       appendNodes(parent, array, marker);
    //     } else reconcileArrays(parent, buffer, array);
    //   } else if (buffer == null || buffer === '') {
    //     appendNodes(parent, array);
    //   } else {
    //     reconcileArrays(parent, (multi && buffer) || [parent.firstChild], array);
    //   }
    // }
    // buffer = array;
  } else if (child instanceof Node) {
    if (Array.isArray(buffer)) {
      if (multi) return (buffer = cleanChildren(parent, marker, buffer, child));
      cleanChildren(parent, null, buffer, child);
    } else if (buffer == null || buffer === '') {
      parent.appendChild(child);
    } else parent.replaceChild(child, parent.firstChild);
    buffer = child;
  }

  return buffer;
}

function cleanChildren(parent, marker, buffer, replacement?: any) {
  if (marker === undefined) return (parent.textContent = '');
  const node = replacement || document.createTextNode('');
  if (buffer.length) {
    node !== buffer[0] && parent.replaceChild(node, buffer[0]);
    for (let i = buffer.length - 1; i > 0; i--) parent.removeChild(buffer[i]);
  } else parent.insertBefore(node, marker);
  return [node];
}

function normalizeValue(value: any): [boolean, any] {
  const t = typeof value;
  if (t === 'string') {
    return [true, value];
  }
  if (t === 'number' || t === 'bigint' || t === 'symbol') {
    return [true, value.toString()];
  }
  if (t === 'boolean' || value == null || value == undefined) {
    return [true, ''];
  }
  if (t === 'function') {
    return normalizeValue(value());
  }
  return [false, value];
}

function wrap(fn: (value: any) => any, property: Property<any>) {
  fn(property.get());
  const observer = { next: () => fn(property.get()) };
  property.subscribe(observer);
}
