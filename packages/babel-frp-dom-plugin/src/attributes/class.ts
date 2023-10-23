import * as t from '@babel/types';
import { NonPrimitiveEvalResult, UnresolvedResult } from '../expression';

type ClassParsingResult = {
  template: string;
  expression?: t.Expression;
};

export function parseClassExpression(
  evalResult: NonPrimitiveEvalResult | UnresolvedResult
): ClassParsingResult {
  if (evalResult.kind === 'non-primitive' && Array.isArray(evalResult.value)) {
    // array of classes: <div class={['button', 'small']} />
    return {
      template: evalResult.value.map(String).join(' '),
    };
  }

  if (
    evalResult.kind === 'non-primitive' &&
    typeof evalResult.value === 'object'
  ) {
    // just a plain object: <div class={{ small: true, ... }} />
    const classes: string[] = [];
    for (const [key, value] of Object.entries(evalResult.value)) {
      if (value) {
        classes.push(key);
      }
    }

    return {
      template: classes.join(' '),
    };
  }

  return {
    template: '',
    expression: evalResult.expression,
  };
}
