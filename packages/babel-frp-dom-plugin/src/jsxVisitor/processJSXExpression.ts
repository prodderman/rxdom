import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { encode } from 'html-entities';
import { registerImport } from '../programVisitor';

import { JSXProcessResult, ProcessContext } from '../types';
import { genId, isPrimitive } from '../utils';

export function processExpressionContainer(
  path: NodePath<t.JSXExpressionContainer>,
  context: ProcessContext
): JSXProcessResult {
  if (!context.parentId) throw Error('Impossible situation happened');
  const id = genId(path, context);
  const result: JSXProcessResult = {
    id: null,
    template: '',
    expressions: [],
    declarations: [],
  };
  const expression = path.get('expression');
  if (t.isJSXEmptyExpression(expression.node)) {
    return result;
  }
  const evaluation = expression.evaluate();

  if (evaluation.confident) {
    if (isPrimitive(evaluation.value)) {
      if (evaluation.value === null || evaluation.value === undefined) {
        return result;
      }

      result.id = id('text');
      result.template = encode(evaluation.value.toString());
      return result;
    }
  }

  result.id = id('mark');
  result.template = context.skipId ? '' : '<!>';
  result.expressions.push(
    t.callExpression(registerImport(path, 'insert'), [
      context.parentId,
      expression.node,
      ...(result.id ? [result.id] : []),
    ])
  );

  return result;
}
