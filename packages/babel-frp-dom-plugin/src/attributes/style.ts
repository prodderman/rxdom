import * as t from '@babel/types';
import { NonPrimitiveEvalResult, UnresolvedResult } from '../expression';

type StyleParsingResult = {
  template: string;
  expression?: t.Expression;
};

const toKebabCase = (str: string) =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? '-' : '') + $.toLowerCase()
  );

export function parseStyleExpression(
  evalResult: NonPrimitiveEvalResult | UnresolvedResult
): StyleParsingResult {
  if (
    evalResult.kind === 'non-primitive' &&
    typeof evalResult.value === 'object'
  ) {
    // just a plain object: <div style={{ display: 'flex', ... }} />

    const cssText: string[] = [];
    for (const [key, value] of Object.entries(evalResult.value)) {
      cssText.push(`${toKebabCase(key)}:${String(value)}`);
    }

    return {
      template: cssText.join(';'),
    };
  }

  // TODO: parse objectExpression more precise

  return {
    template: '',
    expression: evalResult.expression,
  };
}

function parseObjectExpression() {
  //
}
