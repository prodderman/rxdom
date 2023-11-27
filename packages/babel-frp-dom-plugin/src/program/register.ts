/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NodePath } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import * as t from '@babel/types';

import {
  Config,
  DataEntity,
  ImportStorage,
  JSXNodePath,
  RuntimeFn,
  TemplateDeclarations,
  TemplateStorage,
} from '../types';

export function registerTemplate(
  path: JSXNodePath,
  template: string
): t.Identifier {
  const programScope = path.scope.getProgramParent();
  const templateStorage: TemplateStorage = programScope.getData(
    DataEntity.Templates
  );
  const templateDeclarations: TemplateDeclarations = programScope.getData(
    DataEntity.TemplateDeclarations
  );

  if (templateStorage.has(template)) {
    return t.cloneNode(templateStorage.get(template)!, true);
  }

  const id = path.scope.generateUidIdentifier('tmpl$');
  const templateDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      id,
      t.addComment(
        t.callExpression(registerImport(path, 'template'), [
          t.templateLiteral(
            [t.templateElement({ cooked: template, raw: template }, true)],
            []
          ),
        ]),
        'leading',
        '#__PURE__'
      )
    ),
  ]);

  templateStorage.set(template, id);
  templateDeclarations.push(templateDecl);

  return id;
}

export function registerImport(
  path: NodePath,
  fnName: RuntimeFn
): t.Identifier {
  const program = path.scope.getProgramParent();
  const config: Config = program.getData('config');
  const data: ImportStorage = program.getData('imports');

  if (data.has(fnName)) {
    return t.cloneNode(data.get(fnName)!, true);
  }

  const id = addNamed(path, fnName, config.moduleName, {
    nameHint: `$${fnName}`,
  });
  data.set(fnName, id);
  return id;
}
