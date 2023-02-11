import { NodePath } from '@babel/core';
import * as t from '@babel/types';

import { VOID_ELEMENTS } from '../constants';
import { registerImport } from '../programVisitor';
import {
  JSXChildren,
  ProcessContext,
  JSXProcessResult,
  JSXAttributesResult,
} from '../types';
import {
  convertComponentIdentifier,
  getAttributeName,
  getTagName,
  isComponent,
  isPrimitive,
  mkComponentProp,
  toLiteral,
} from '../utils';
import { processNode } from './processNode';
import { processText } from './processText';

export function processJSXElement(
  path: NodePath<t.JSXElement>,
  context: ProcessContext
): JSXProcessResult {
  const tagName = getTagName(path.node);

  if (isComponent(tagName)) {
    return processComponent(path, context);
  }

  const isVoidTag = VOID_ELEMENTS.includes(tagName);
  const id = path.scope.generateUidIdentifierBasedOnNode(path.node, 'el$');
  const attributesResult = processTagAttributes(path, id);
  const attributesTemplate =
    attributesResult.attributes.length === 0
      ? ''
      : ' ' + attributesResult.attributes.join(' ');

  if (isVoidTag) {
    return {
      id,
      template: `<${tagName}${attributesTemplate}/>`,
      declarations: [],
      expressions: attributesResult.expressions,
    };
  }

  const childrenResults = processTagChildren(path, id);

  const childrenTemplate = childrenResults
    .map((child) => child.template)
    .join('');

  const childrenDeclarations = childrenResults.flatMap(
    (child) => child.declarations
  );

  const childrenExpressions = childrenResults.flatMap(
    (child) => child.expressions
  );

  const needToFindElement = childrenExpressions.length > 0;
  const declarations = needToFindElement
    ? childrenResults.reduce<{
        declarations: t.VariableDeclarator[];
        prevId: t.Identifier;
      }>(
        (acc, child, idx) => {
          if (child.id) {
            acc.declarations.push(
              t.variableDeclarator(
                child.id,
                t.memberExpression(
                  acc.prevId,
                  t.identifier(idx === 0 ? 'firstChild' : 'nextSibling')
                )
              )
            );
            acc.prevId = child.id;
          }
          return acc;
        },

        { declarations: [], prevId: id }
      ).declarations
    : [];

  return {
    id,
    template: `<${tagName}${attributesTemplate}>${childrenTemplate}</${tagName}>`,
    declarations: declarations.concat(childrenDeclarations),
    expressions: attributesResult.expressions.concat(childrenExpressions),
  };
}

function processComponent(
  path: NodePath<t.JSXElement>,
  context: ProcessContext
): JSXProcessResult {
  const id = !context.skipId
    ? path.scope.generateUidIdentifierBasedOnNode(path.node)
    : null;

  const componentName = convertComponentIdentifier(
    path.node.openingElement.name
  );

  const childrenResults = processArrayChildren(path);
  const childrenProp =
    childrenResults.length > 0
      ? [
          mkComponentProp(
            'children',
            childrenResults.length === 1
              ? childrenResults[0]
              : t.arrayExpression(childrenResults),
            true
          ),
        ]
      : [];

  const props = t.objectExpression(
    childrenProp.concat(processComponentProps(path))
  );

  const createComponentExpr = t.callExpression(
    registerImport(path, 'createComponent'),
    [componentName, props]
  );

  const mInsertExpr = context.parentId
    ? t.callExpression(registerImport(path, 'insert'), [
        context.parentId,
        createComponentExpr,
        ...(id ? [id] : []),
      ])
    : createComponentExpr;

  return {
    id,
    expressions: [mInsertExpr],
    declarations: [],
    template: context.parentId && !context.skipId ? '<!>' : '',
  };
}

export function processArrayChildren(
  path: NodePath<t.JSXElement | t.JSXFragment>
): t.Expression[] {
  return path
    .get('children')
    .filter(uselessChildren)
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
function processComponentProps(
  path: NodePath<t.JSXElement>
): (t.ObjectMethod | t.ObjectProperty)[] {
  return path
    .get('openingElement')
    .get('attributes')
    .map((attr) => {
      if (t.isJSXSpreadAttribute(attr.node)) {
        throw new Error('Spread is not implemented');
      }

      const key = getAttributeName(attr as NodePath<t.JSXAttribute>);
      const value = attr.node.value;

      if (value === null || value === undefined) {
        return mkComponentProp(key, t.booleanLiteral(true), false);
      }

      if (t.isStringLiteral(value)) {
        return mkComponentProp(key, value, false);
      }

      if (t.isJSXExpressionContainer(value)) {
        if (t.isJSXEmptyExpression(value.expression)) {
          return mkComponentProp(key, t.booleanLiteral(true), false);
        }

        const valuePath = attr.get(
          'value'
        ) as NodePath<t.JSXExpressionContainer>;
        const evalResult = valuePath.get('expression').evaluate();
        if (evalResult.confident) {
          if (isPrimitive(evalResult.value)) {
            return mkComponentProp(key, toLiteral(evalResult.value), false);
          }

          return mkComponentProp(key, value.expression, false);
        }

        if (t.isIdentifier(value.expression)) {
          return mkComponentProp(key, value.expression, false);
        }

        return mkComponentProp(key, value.expression, true);
      }

      return mkComponentProp(key, value, true);
    });
}

function processTagChildren(
  path: NodePath<t.JSXElement>,
  parentId: t.Identifier
): JSXProcessResult[] {
  return path
    .get('children')
    .flatMap(unwrapFragment)
    .filter(uselessChildren)
    .map((child, idx, children) => {
      return processNode(child, {
        parentId,
        skipId:
          children.length === 1 ||
          children
            .slice(idx)
            .findIndex(
              (child) =>
                t.isJSXExpressionContainer(child.node) ||
                t.isJSXSpreadChild(child.node)
            ) === -1,
      });
    });
}

function processTagAttributes(
  path: NodePath<t.JSXElement>,
  elementId: t.Identifier
): JSXAttributesResult {
  const attributes = path.get('openingElement').get('attributes');

  return attributes.reduce<JSXAttributesResult>(
    (acc, attr) => {
      if (t.isJSXAttribute(attr.node)) {
        const value = attr.node.value;
        const key = getAttributeName(attr as NodePath<t.JSXAttribute>);

        if (value === undefined || value === null) {
          acc.attributes.push(key);
        } else if (
          t.isJSXExpressionContainer(value) &&
          !t.isJSXEmptyExpression(value.expression)
        ) {
          const valuePath = attr.get(
            'value'
          ) as NodePath<t.JSXExpressionContainer>;
          const evalResult = valuePath.get('expression').evaluate();
          if (
            evalResult.confident &&
            (evalResult.value !== undefined || evalResult.value !== null)
          ) {
            acc.attributes.push(`${key}="${evalResult.value}"`);
          } else {
            acc.expressions.push(
              t.callExpression(registerImport(path, 'setAttribute'), [
                elementId,
                t.stringLiteral(key),
                value.expression,
              ])
            );
          }
        } else if (t.isStringLiteral(value)) {
          acc.attributes.push(`${key}="${value.value}"`);
        }
      }

      return acc;
    },
    { attributes: [], expressions: [] }
  );
}

function uselessChildren(child: NodePath<JSXChildren>) {
  return (
    !(
      t.isJSXExpressionContainer(child.node) &&
      t.isJSXEmptyExpression(child.node.expression)
    ) &&
    (!t.isJSXText(child.node) ||
      !/^[\r\n\s]*$/.test((child.node.extra?.raw as string) ?? ''))
  );
}

function unwrapFragment(path: NodePath<JSXChildren>): NodePath<JSXChildren>[] {
  if (t.isJSXFragment(path.node)) {
    return (path as NodePath<t.JSXFragment>)
      .get('children')
      .flatMap(unwrapFragment);
  }

  return [path];
}
