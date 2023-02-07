import * as t from '@babel/types';
import { getRendererConfig, registerImportMethod } from './utils';
// import { appendTemplates as appendTemplatesDOM } from '../dom/template';
// import { appendTemplates as appendTemplatesSSR } from '../ssr/template';
import { NodePath, PluginPass } from '@babel/core';

// add to the top/bottom of the module.
export default (path: NodePath<t.Program>, state: PluginPass) => {
  const templates: t.VariableDeclaration[] | undefined =
    path.scope.getData('templates');

  templates?.forEach((decl) => {
    path.node.body.unshift(decl);
  });
  // console.log(state);
  // if (path.scope.data.templates?.length) {
  //   let domTemplates = path.scope.data.templates.filter(
  //     (temp) => temp.renderer === 'dom'
  //   );
  //   let ssrTemplates = path.scope.data.templates.filter(
  //     (temp) => temp.renderer === 'ssr'
  //   );
  //   domTemplates.length > 0 && appendTemplatesDOM(path, domTemplates);
  //   ssrTemplates.length > 0 && appendTemplatesSSR(path, ssrTemplates);
  // }
  // const decl = t.variableDeclaration('const', [
  //   t.variableDeclarator(
  //     t.identifier('test'),
  //     t.jsxElement(
  //       t.jsxOpeningElement(
  //         t.jsxMemberExpression(t.jsxIdentifier('div'), t.jsxIdentifier('div')),
  //         [],
  //         true
  //       ),
  //       null,
  //       []
  //     )
  //   ),
  // ]);

  // path.node.body.unshift(decl);
};
