import { NodePath } from '@babel/core';
import * as t from '@babel/types';

import { ParsedAttributeName } from './name';
import { AttributeValuePath } from './types';
import { isJSXExpressionContainerPath } from '../utils';
import { evalExpression } from '../expression';

export type EventHandlerParsingResult = {
  key: string;
  template: string;
  expression?: t.Expression;
  handler?: {
    eventName: string;
    capture: boolean;
    resolved: boolean;
  };
};

export function parseEventHandler(
  { key, name, namespace }: ParsedAttributeName,
  value: AttributeValuePath
): EventHandlerParsingResult {
  if (value.node === undefined || value.node === null) {
    return {
      key,
      template: '',
    };
  }

  if (t.isStringLiteral(value.node)) {
    return {
      key,
      template: `${name}="${value.node.value}"`,
    };
  }

  if (isJSXExpressionContainerPath(value)) {
    const evalResult = evalExpression(value.get('expression'));
    if (evalResult.kind === 'void' || evalResult.kind === 'empty') {
      return {
        key,
        template: '',
      };
    }

    if (evalResult.kind === 'primitive') {
      return {
        key,
        template: `${name}="${evalResult.value}"`,
        expression: evalResult.expression,
      };
    }

    const eventName = name.substring(2).toLocaleLowerCase();
    const capture = namespace === 'capture';

    return {
      key,
      template: '',
      expression: evalResult.expression,
      handler: {
        eventName,
        capture,
        resolved: evalResult.kind === 'non-primitive' || canBeResolved(value),
      },
    };
  }

  throw new Error(`Unexpected event handler: ${key}=${value.node.type}`);
}

function canBeResolved(path: NodePath<t.JSXExpressionContainer>) {
  let handler = path.get('expression').node as t.Expression | null | undefined;
  while (t.isIdentifier(handler)) {
    const binding = path.scope.getBinding(handler.name);
    if (binding) {
      if (t.isVariableDeclarator(binding.path.node)) {
        handler = binding.path.node.init;
      } else if (t.isFunctionDeclaration(binding.path.node)) {
        return true;
      } else return false;
    } else return false;
  }
  return t.isFunction(handler);
}
