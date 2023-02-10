import { NodePath } from '@babel/core';
import * as t from '@babel/types';

export type JSXNodePath = NodePath<t.JSXElement> | NodePath<t.JSXFragment>;
export type JSXChildren =
  | t.JSXElement
  | t.JSXFragment
  | t.JSXExpressionContainer
  | t.JSXSpreadChild
  | t.JSXText;

export type JSXElementResult = {
  kind: 'jsx';
  id: t.Identifier;
  template: string;
  statements: t.Statement[];
};

export type JSXChildrenResult = {
  id: t.Identifier | null;
  template: string;
  statements: t.Statement[];
};

export type JSXExpressionResult = {
  kind: 'expression';
  id: t.Identifier | null;
  template: string;
  expression: t.Expression | null;
};

export type JSXTextResult = {
  kind: 'text';
  id: t.Identifier;
  template: string;
};

export type ProcessResult =
  | JSXElementResult
  | JSXExpressionResult
  | JSXTextResult;

export type ProcessContext = {
  parentId?: t.Identifier;
  skipId?: boolean;
};

export type Config = {
  moduleName: string;
};

export type ImportStorage = Map<string, t.Identifier>;
export type TemplateStorage = Map<string, t.Identifier>;

export type RuntimeFn =
  | 'insert'
  | 'template'
  | 'createComponent'
  | 'setAttribute';
