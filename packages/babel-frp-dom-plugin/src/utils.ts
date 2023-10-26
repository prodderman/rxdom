import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { decode } from 'html-entities';
import { JSXChildren, PrimitiveType, ProcessContext } from './types';

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

export function isChildUseless(child: NodePath<JSXChildren>) {
  return (
    !(
      t.isJSXExpressionContainer(child.node) &&
      t.isJSXEmptyExpression(child.node.expression)
    ) &&
    (!t.isJSXText(child.node) ||
      !/^[\r\n\s]*$/.test((child.node.extra?.raw as string) ?? ''))
  );
}

export function unwrapFragment(
  path: NodePath<JSXChildren>
): NodePath<JSXChildren>[] {
  if (t.isJSXFragment(path.node)) {
    return (path as NodePath<t.JSXFragment>)
      .get('children')
      .flatMap(unwrapFragment);
  }

  return [path];
}

export function processArrayChildren(
  path: NodePath<t.JSXElement | t.JSXFragment>
): t.Expression[] {
  return path
    .get('children')
    .filter(isChildUseless)
    .map((child) => {
      if (t.isJSXText(child.node)) {
        return t.stringLiteral(processText(child.node));
      }

      if (t.isJSXExpressionContainer(child.node)) {
        return child.node.expression as t.Expression;
      }

      if (t.isJSXSpreadChild(child.node)) {
        return child.node.expression;
      }

      return child.node;
    });
}

export function processText(text: t.JSXText): string {
  return decode(trimWhitespace((text.extra?.raw as string) ?? ''));
}

function trimWhitespace(text: string) {
  text = text.replace(/\r/g, '');
  if (/\n/g.test(text)) {
    text = text
      .split('\n')
      .map((t, i) => (i ? t.replace(/^\s*/g, '') : t))
      .filter((s) => !/^\s*$/.test(s))
      .join(' ');
  }
  text = text.replace(/\s+/g, ' ');
  return text;
}

const camelCaseRegexp = /[A-Z]+(?![a-z])|[A-Z]/g;

export function toKebabCase(str: string) {
  return str.replace(camelCaseRegexp, ($, position, str) => {
    return (position && str[position - 1] !== '-' ? '-' : '') + $.toLowerCase();
  });
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
    value == null
  );
}

export const genId =
  (path: NodePath, context: ProcessContext) => (placeholder: string) =>
    !context.skipId
      ? path.scope.generateUidIdentifierBasedOnNode(path.node, placeholder)
      : null;

export function isJSXElementPath(
  path: NodePath
): path is NodePath<t.JSXElement> {
  return t.isJSXElement(path.node);
}

export function isJSXSpreadAttributePath(
  path: NodePath
): path is NodePath<t.JSXSpreadAttribute> {
  return t.isJSXSpreadAttribute(path.node);
}

export function isJSXAttributePath(
  path: NodePath
): path is NodePath<t.JSXAttribute> {
  return t.isJSXAttribute(path.node);
}

export function isJSXEmptyExpressionPath(
  path: NodePath
): path is NodePath<t.JSXEmptyExpression> {
  return t.isJSXEmptyExpression(path.node);
}

export function isExpressionPath(
  path: NodePath
): path is NodePath<t.Expression> {
  return t.isExpression(path.node);
}

export function isJSXExpressionContainerPath(
  path: NodePath<any>
): path is NodePath<t.JSXExpressionContainer> {
  return t.isJSXExpressionContainer(path.node);
}
