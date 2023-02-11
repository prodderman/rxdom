import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { PrimitiveType, ProcessContext } from './types';

function jsxElementNameToString(
  identifier: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName
): string {
  if (t.isJSXMemberExpression(identifier)) {
    return `${jsxElementNameToString(identifier.object)}.${
      identifier.property.name
    }`;
  }
  if (t.isJSXIdentifier(identifier) || t.isIdentifier(identifier)) {
    return identifier.name;
  }
  return `${identifier.namespace.name}:${identifier.name.name}`;
}

export function getTagName(tag: t.JSXElement): string {
  const jsxName = tag.openingElement.name;
  return jsxElementNameToString(jsxName);
}

export function isComponent(tagName: string) {
  return (
    (tagName[0] && tagName[0].toLowerCase() !== tagName[0]) ||
    tagName.includes('.') ||
    /[^a-zA-Z]/.test(tagName[0])
  );
}

export function convertComponentIdentifier(
  node: t.JSXOpeningElement['name']
): t.StringLiteral | t.Identifier | t.MemberExpression {
  if (t.isJSXIdentifier(node)) {
    if (t.isValidIdentifier(node.name)) {
      return t.identifier(node.name);
    }
    return t.stringLiteral(node.name);
  }

  if (t.isJSXMemberExpression(node)) {
    const prop = convertComponentIdentifier(node.property);
    const computed = t.isStringLiteral(prop);
    return t.memberExpression(
      convertComponentIdentifier(node.object),
      prop,
      computed
    );
  }

  throw new Error(`Unexpected namespace for: ${node.name}`);
}

export function mkComponentProp(
  name: string,
  value: t.Expression,
  lazy: boolean
) {
  return lazy
    ? t.objectMethod(
        'get',
        t.stringLiteral(name),
        [],
        t.blockStatement([t.returnStatement(value)])
      )
    : t.objectProperty(t.stringLiteral(name), value);
}

export function toLiteral(value: PrimitiveType) {
  if (typeof value === 'string') {
    return t.stringLiteral(value);
  }

  if (typeof value === 'number') {
    return t.numericLiteral(value);
  }

  if (typeof value === 'boolean') {
    return t.booleanLiteral(value);
  }

  if (value === null) {
    return t.nullLiteral();
  }

  if (typeof value === 'undefined') {
    return t.identifier('undefined');
  }

  throw new Error(`Unexpected type ${typeof value}`);
}

export function isPrimitive(value: unknown): value is PrimitiveType {
  const type = typeof value;

  return (
    type === 'boolean' ||
    type === 'number' ||
    type === 'string' ||
    type === 'undefined' ||
    value === null
  );
}

export function getAttributeName<N extends t.JSXAttribute>(attr: NodePath<N>) {
  return t.isJSXNamespacedName(attr.node.name)
    ? `${attr.node.name.namespace.name}:${attr.node.name.name.name}`
    : attr.node.name.name;
}

export const genId =
  (path: NodePath, context: ProcessContext) => (placeholder: string) =>
    !context.skipId
      ? path.scope.generateUidIdentifierBasedOnNode(path.node, placeholder)
      : null;
