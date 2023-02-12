import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { encode } from 'html-entities';
import { registerImport } from '../programVisitor';

import { JSXProcessResult, PrimitiveType, ProcessContext } from '../types';
import { genId, isExpressionPath, isPrimitive } from '../utils';

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

  const evalResult = evalExpression(path);

  if (evalResult.type === 'void' || evalResult.type === 'empty') {
    return result;
  }

  if (evalResult.type === 'primitive') {
    result.id = id('text');
    result.template = encode(evalResult.value.toString());
    return result;
  }

  result.id = id('mark');
  result.template = context.skipId ? '' : '<!>';
  result.expressions.push(
    t.callExpression(registerImport(path, 'insert'), [
      context.parentId,
      evalResult.expression,
      ...(result.id ? [result.id] : []),
    ])
  );

  return result;
}

type VoidEvalResult = {
  type: 'void';
};

type EmptyResult = {
  type: 'empty';
  value: undefined | null;
  expression: t.Expression;
};

type PrimitiveEvalResult = {
  type: 'primitive';
  value: Exclude<PrimitiveType, null | undefined>;
  expression: t.Expression;
};

type NonPrimitiveEvalResult = {
  type: 'non-primitive';
  value: object;
  expression: t.Expression;
};

type NotEvaluatedResult = {
  type: 'expression';
  expression: t.Expression;
};

type EvalResult =
  | VoidEvalResult
  | EmptyResult
  | PrimitiveEvalResult
  | NonPrimitiveEvalResult
  | NotEvaluatedResult;

export function evalExpression(
  path: NodePath<t.JSXExpressionContainer>
): EvalResult {
  const expression = path.get('expression');

  if (isExpressionPath(expression)) {
    const evalResult = expression.evaluate();
    if (evalResult.confident) {
      if (isPrimitive(evalResult.value)) {
        if (evalResult.value === undefined || evalResult.value === null) {
          return {
            type: 'empty',
            value: evalResult.value,
            expression: expression.node,
          };
        }

        return {
          type: 'primitive',
          value: evalResult.value,
          expression: expression.node,
        };
      }
      return {
        type: 'non-primitive',
        value: expression.node,
        expression: expression.node,
      };
    }

    return {
      type: 'expression',
      value: expression.node,
      expression: expression.node,
    };
  }

  return { type: 'void' };
}
