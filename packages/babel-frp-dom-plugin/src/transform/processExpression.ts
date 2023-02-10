import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { encode } from 'html-entities';
import { registerImport } from '../programVisitor';

import { JSXProcessResult, PrimitiveType, ProcessContext } from '../types';
import { isPrimitive } from '../utils';

export function processExpressionContainer(
  path: NodePath<t.JSXExpressionContainer>,
  context: ProcessContext
): JSXProcessResult {
  if (!context.parentId) throw Error('Impossible situation happened');
  const value = evalJSXExpression(path.get('expression'));
  const id = genId(path, context);
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
    result.id = id('text');
    result.template = encode(value.toString());
    return result;
  }

  result.id = id('mark');
  result.template = context.skipId ? '' : '<!>';
  result.expressions.push(
    t.callExpression(registerImport(path, 'insert'), [
      context.parentId,
      value,
      ...(result.id ? [result.id] : []),
    ])
  );

  return result;
}

export function evalJSXExpression(
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

const genId =
  (path: NodePath, context: ProcessContext) => (placeholder: string) =>
    !context.skipId
      ? path.scope.generateUidIdentifierBasedOnNode(path.node, placeholder)
      : null;
