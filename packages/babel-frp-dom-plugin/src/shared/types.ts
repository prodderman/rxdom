import * as t from '@babel/types';

export type Results = {
  id?: t.Identifier;
  template: string;
  decl: any[];
  exprs: any[];
  dynamics: any[];
  postExprs: any[];
  tagName: string;
};

export type Config = {
  moduleName: string;
};
