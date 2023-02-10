import * as t from '@babel/types';

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
