import * as t from '@babel/types';
import { PrimitiveType } from '../types';
import { NodePath } from '@babel/core';
import { isExpressionPath, isPrimitive } from '../utils';

type VoidEvalResult = {
  kind: 'void';
};

type EmptyResult = {
  kind: 'empty';
  value: undefined | null;
  expression: t.Expression;
};

type PrimitiveEvalResult = {
  kind: 'primitive';
  value: Exclude<PrimitiveType, null | undefined>;
  expression: t.Expression;
};

type NonPrimitiveEvalResult = {
  kind: 'non-primitive';
  value: t.Expression; // objects, functions, etc.
  expression: t.Expression;
};

type UnresolvedResult = {
  kind: 'unresolved';
  expression: t.Expression;
};

type EvalResult =
  | VoidEvalResult
  | EmptyResult
  | PrimitiveEvalResult
  | NonPrimitiveEvalResult
  | UnresolvedResult;

export function evalExpression(
  expression: NodePath<t.Expression | t.JSXEmptyExpression>
): EvalResult {
  if (isExpressionPath(expression)) {
    const evalResult = expression.evaluate();

    if (evalResult.confident) {
      if (isPrimitive(evalResult.value)) {
        if (evalResult.value == null) {
          return {
            kind: 'empty',
            value: evalResult.value,
            expression: expression.node,
          };
        }

        return {
          kind: 'primitive',
          value: evalResult.value,
          expression: expression.node,
        };
      }

      return {
        kind: 'non-primitive',
        value: expression.node,
        expression: expression.node,
      };
    }

    return {
      kind: 'unresolved',
      expression: expression.node,
    };
  }

  return { kind: 'void' };
}
