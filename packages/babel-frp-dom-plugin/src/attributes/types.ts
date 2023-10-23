import { NodePath } from '@babel/core';
import * as t from '@babel/types';

export type AttributeValuePath = NodePath<
  | t.StringLiteral
  | t.JSXElement
  | t.JSXFragment
  | t.JSXExpressionContainer
  | null
  | undefined
>;
