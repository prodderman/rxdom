import * as t from '@babel/types';
import { NodePath } from '@babel/core';
import { DataEntity, TemplateDeclarations } from '../types';

export const postprocess = (path: NodePath<t.Program>) => {
  const templates: TemplateDeclarations = path.scope.getData(
    DataEntity.TemplateDeclarations
  );
  const programScope = path.scope.getProgramParent();
  const program = programScope.block as t.Program;
  const lastImportIdx = getIdxToInsertTemplate(program);

  program.body.splice(lastImportIdx, 0, ...templates);
};

function getIdxToInsertTemplate(program: t.Program) {
  let idx = 0;
  while (t.isImportDeclaration(program.body[idx])) {
    idx += 1;
  }

  return idx;
}
