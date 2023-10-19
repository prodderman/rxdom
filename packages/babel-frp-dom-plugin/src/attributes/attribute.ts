import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { isJSXExpressionContainerPath } from '../utils';
import { evalExpression } from '../expression';

export type AttributeValuePath = NodePath<
  | t.StringLiteral
  | t.JSXElement
  | t.JSXFragment
  | t.JSXExpressionContainer
  | null
  | undefined
>;

export type AttributeParseResult =
  | {
      kind: 'void';
    }
  | {
      kind: 'boolean';
      key: string;
    }
  | {
      kind: 'key-value';
      key: string;
      value: string;
    }
  | {
      kind: 'expression';
      key: string;
      expression: t.Expression;
    };

export function parseAttribute(
  [key]: [string, string?], // pair [name, namespace] <div namespace:attr={42} />
  value: AttributeValuePath
): AttributeParseResult {
  // boolean attribute: <div attr />
  if (value.node === undefined || value.node === null) {
    return {
      kind: 'boolean',
      key,
    };
  }

  // name="value" attribute: <div attr="value" />
  if (t.isStringLiteral(value.node)) {
    return {
      kind: 'key-value',
      key,
      value: value.node.value,
    };
  }

  // expression attribute: <div attr={value} />
  if (isJSXExpressionContainerPath(value)) {
    const evalResult = evalExpression(value.get('expression'));

    // <div attr={undefined} /> or <div attr={null} /> <div attr={} />
    if (evalResult.kind === 'void' || evalResult.kind === 'empty') {
      return {
        kind: 'void',
      };
    }

    // <div attr={"value"} /> -> <div attr="value" />
    // <div attr={42} /> -> <div attr="42" />
    // <div attr={false} /> -> <div attr="false" />
    if (evalResult.kind === 'primitive') {
      return {
        kind: 'key-value',
        key,
        value: evalResult.value.toString(),
      };
    }

    if (evalResult.kind === 'non-primitive') {
      return {
        kind: 'expression',
        key,
        expression: evalResult.value,
      };
    }

    /**
     * TODO: parse expression more precise
     * Example:
     * 
     * <div attr={{ a: someVariable }}/>
     * In this case I could throw an error 
     * because any objects in attributes are not valid
     */
    return {
      kind: 'expression',
      key,
      expression: evalResult.expression,
    };
  }

  throw new Error(`Unexpected attribute key-value ${key}=${value.node.type}`);
}
