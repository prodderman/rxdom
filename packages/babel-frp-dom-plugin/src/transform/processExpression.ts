import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { registerImport } from '../programVisitor';

import { JSXProcessResult, PrimitiveType, ProcessContext } from '../types';

export function processExpressionContainer(
  path: NodePath<t.JSXExpressionContainer>,
  context: ProcessContext
): JSXProcessResult {
  if (!context.parentId) throw Error('Impossible situation happened');
  const value = evalJSXExpressionContainer(path.get('expression'));
  const result: JSXProcessResult = {
    id: null,
    template: '',
    expressions: [],
    declarations: [],
  };

  if (isPrimitive(value)) {
    if (value === undefined || value === null) {
      return result;
    }
    result.template = value.toString();
    return result;
  }

  const id = !context.skipId
    ? path.scope.generateUidIdentifierBasedOnNode(path.node, 'mark')
    : null;

  result.id = id;
  result.template = context.skipId ? '' : '<!>';

  result.expressions.push(
    t.callExpression(registerImport(path, 'insert'), [
      context.parentId,
      value,
      ...(id ? [id] : []),
    ])
  );

  return result;
}

export function evalJSXExpressionContainer(
  expression: NodePath<t.Expression | t.JSXEmptyExpression>
): t.Expression | PrimitiveType | undefined {
  if (t.isJSXEmptyExpression(expression.node)) {
    return undefined;
  }

  const evaluation = expression.evaluate();
  if (evaluation.confident) {
    return evaluation.value;
  }

  return expression.node;
}

function isPrimitive(value: unknown): value is PrimitiveType {
  const type = typeof value;

  return (
    type === 'bigint' ||
    type === 'boolean' ||
    type === 'number' ||
    type === 'string' ||
    type === 'symbol' ||
    type === 'undefined' ||
    value === null
  );
}
