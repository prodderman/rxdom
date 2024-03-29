import { NodePath } from '@babel/core';
import * as t from '@babel/types';

import { ParsedAttributeName } from './name';
import { AttributeValuePath } from './types';
import { isJSXExpressionContainerPath } from '../utils';

export type RefParsingResult = t.Identifier | null;

export function parseRef(
  { key, name, namespace }: ParsedAttributeName,
  value: AttributeValuePath
): RefParsingResult {
  if (isJSXExpressionContainerPath(value)) {
    const expression = value.node.expression;

    if (t.isIdentifier(expression)) {
      return expression;
    }
  }

  return null;
}
