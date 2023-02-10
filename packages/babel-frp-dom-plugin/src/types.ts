import { NodePath } from '@babel/core';
import * as t from '@babel/types';

export type JSXNodePath = NodePath<t.JSXElement> | NodePath<t.JSXFragment>;

export type JSXChildren =
  | t.JSXElement
  | t.JSXFragment
  | t.JSXExpressionContainer
  | t.JSXSpreadChild
  | t.JSXText;

export type JSXProcessResult = {
  id: t.Identifier | null;
  template: string;
  declarations: t.VariableDeclarator[];
  expressions: t.Expression[];
};

export type JSXAttributesResult = {
  attributes: string[];
  expressions: t.Expression[];
};

export type ProcessContext = {
  parentId?: t.Identifier;
  skipId?: boolean;
};

export type Config = {
  moduleName: string;
};

export type PrimitiveType = string | number | boolean | undefined | null;
export type ImportStorage = Map<string, t.Identifier>;
export type TemplateStorage = Map<string, t.Identifier>;

export type RuntimeFn =
  | 'insert'
  | 'template'
  | 'createComponent'
  | 'setAttribute';
