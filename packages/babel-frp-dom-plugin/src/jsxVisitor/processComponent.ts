import { NodePath } from '@babel/core';
import * as t from '@babel/types';

import { registerImport } from '../programVisitor';
import { ProcessContext, JSXProcessResult } from '../types';
import {
  convertComponentIdentifier,
  parseAttributeName,
  isPrimitive,
  mkComponentProp,
  processArrayChildren,
  toLiteral,
} from '../utils';

export function processComponent(
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

      const [key] = parseAttributeName(attr as NodePath<t.JSXAttribute>);
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
