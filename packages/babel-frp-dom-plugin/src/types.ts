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
  template: string; // static attributes
  expressions: t.Expression[]; // attributes with expressions
};

export type ProcessContext = {
  parentId?: t.Identifier;
  skipId?: boolean;
};

export type Config = {
  moduleName: string;
};

export type PrimitiveType =
  | string
  | number
  | boolean
  | bigint
  | undefined
  | null;
export type ImportStorage = Map<string, t.Identifier>;
export type TemplateStorage = Map<string, t.Identifier>;
export type TemplateDeclarations = t.VariableDeclaration[];

export enum DataEntity {
  Templates = 'templates',
  TemplateDeclarations = 'templateDeclarations',
  Imports = 'imports',
  Config = 'config',
}

export type RuntimeFn =
  | 'insert'
  | 'template'
  | 'createComponent'
  | 'setEventListener'
  | 'setAttribute'
  | 'spreadAttributes'
  | 'setStyle'
  | 'setClass'
  | 'setValue';
