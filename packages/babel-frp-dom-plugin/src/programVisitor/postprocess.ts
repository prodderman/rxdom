import * as t from '@babel/types';
import { NodePath } from '@babel/core';

export const postprocess = (path: NodePath<t.Program>) => {
  // const templates: t.VariableDeclaration[] | undefined =
  //   path.scope.getData('templates');
  // templates?.forEach((decl) => {
  //   path.node.body.unshift(decl);
  // });
};
