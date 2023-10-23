import { NodePath } from '@babel/core';
import * as t from '@babel/types';

export type ParsedAttributeName = {
  key: string;
  name: string;
  namespace?: string;
};

export function parseAttributeName(
  attr: NodePath<t.JSXAttribute>
): ParsedAttributeName {
  return t.isJSXNamespacedName(attr.node.name)
    ? {
        key: `${attr.node.name.namespace.name}:${attr.node.name.name.name}`,
        name: attr.node.name.name.name,
        namespace: attr.node.name.namespace.name,
      }
    : {
        key: attr.node.name.name,
        name: attr.node.name.name,
      };
}

export function isEventHandler(name: string) {
  return name.startsWith('on');
}
