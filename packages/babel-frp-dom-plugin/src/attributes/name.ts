import { NodePath } from "@babel/core";
import * as t from "@babel/types";

export function parseAttributeName(
  attr: NodePath<t.JSXAttribute>
): [string, string?] {
  return t.isJSXNamespacedName(attr.node.name)
    ? [attr.node.name.name.name, attr.node.name.namespace.name]
    : [attr.node.name.name];
}
