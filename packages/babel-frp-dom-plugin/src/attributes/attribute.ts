import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { isJSXExpressionContainerPath } from '../utils';
import { evalExpression } from '../expression';
import { parseStyleExpression } from './style';
import { ParsedAttributeName } from './name';
import { AttributeValuePath } from './types';
import { parseClassExpression } from './class';

export type AttributeParsingResult = {
  key: string;
  template: string;
  expression?: t.Expression;
};

export function parseAttribute(
  { key, name }: ParsedAttributeName,
  value: AttributeValuePath
): AttributeParsingResult {
  // boolean attribute: <div attr />
  if (value.node === undefined || value.node === null) {
    return {
      key,
      template: name,
    };
  }

  // name="value" attribute: <div attr="value" />
  if (t.isStringLiteral(value.node)) {
    return {
      key,
      template: `${name}="${value.node.value}"`,
    };
  }

  // expression attribute: <div attr={value} />
  if (isJSXExpressionContainerPath(value)) {
    const evalResult = evalExpression(value.get('expression'));

    // <div attr={undefined} /> or <div attr={null} /> <div attr={} />
    if (evalResult.kind === 'void' || evalResult.kind === 'empty') {
      return {
        key,
        template: '',
      };
    }

    // <div attr={"value"} /> -> <div attr="value" />
    // <div attr={42} /> -> <div attr="42" />
    // <div attr={false} /> -> <div attr="false" />
    if (evalResult.kind === 'primitive') {
      return {
        key,
        template: `${name}="${evalResult.value.toString()}"`,
        expression: evalResult.expression,
      };
    }

    if (name === 'class' || name === 'className') {
      const result = parseClassExpression(evalResult);

      return {
        key,
        template: result.template !== '' ? `class="${result.template}"` : '',
        expression: result.expression,
      };
    }

    if (name === 'style') {
      const styleParsingResult = parseStyleExpression(evalResult);

      return {
        key,
        template:
          styleParsingResult.template !== ''
            ? `style="${styleParsingResult.template}"`
            : '',
        expression: styleParsingResult.expression,
      };
    }

    /**
     * TODO: parse expression more precise
     * Example:
     *
     * <div attr={{ a: someVariable }}/>
     * In this case I could throw an error
     * because any objects in attributes except "style" and "class" are not valid
     */
    return {
      key,
      template: '',
      expression: evalResult.expression,
    };
  }

  throw new Error(`Unexpected attribute: ${key}=${value.node.type}`);
}
