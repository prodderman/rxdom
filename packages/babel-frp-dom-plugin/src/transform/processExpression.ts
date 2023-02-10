import { NodePath } from '@babel/core';
import * as t from '@babel/types';

import { JSXExpressionResult, ProcessContext } from '../types';

export function processExpressionContainer(
  path: NodePath<t.JSXExpressionContainer>,
  context: ProcessContext
): JSXExpressionResult {
  const expression = path.node.expression;
  const result: JSXExpressionResult = {
    kind: 'expression',
    id: null,
    expression: null,
    template: '',
  };

  if (t.isJSXEmptyExpression(expression)) {
    return result;
  }

  const evaluation = path.get('expression').evaluate();
  if (evaluation.confident) {
    if (isPrimitive(evaluation.value)) {
      result.template = evaluation.value.toString();
      return result;
    }

    if (evaluation.value === undefined || evaluation.value === null) {
      return result;
    }
  }

  result.id = context.skipId
    ? null
    : path.scope.generateUidIdentifierBasedOnNode(path.node, 'expr');
  result.template = context.skipId ? '' : '<!>';
  result.expression = expression;

  return result;
}

function isPrimitive(value: any) {
  const type = typeof value;

  return (
    type === 'bigint' ||
    type === 'boolean' ||
    type === 'number' ||
    type === 'string' ||
    type === 'symbol'
  );
}
