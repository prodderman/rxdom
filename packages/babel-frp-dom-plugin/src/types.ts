import { NodePath } from '@babel/core';
import * as t from '@babel/types';

export type JSXNodePath = NodePath<t.JSXElement> | NodePath<t.JSXFragment>;

export type Result = {
  id: t.Identifier;
  template: string;
  tagName: string;
};

export type Config = {
  moduleName: string;
};

export type ImportStorage = Map<string, t.Identifier>;

export type RuntimeFn = 'template' | 'createComponent' | 'setAttribute';
