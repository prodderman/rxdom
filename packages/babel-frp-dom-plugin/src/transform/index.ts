import { registerTemplate } from '../programVisitor';

import { JSXElementResult, JSXNodePath } from '../types';
import { createReplacementNode } from './createReplacmetNode';
import { processNode } from './processNode';

export function transformJSX(path: JSXNodePath) {
  const processResult = processNode(path, {});
  const templateId = registerTemplate(path, processResult.template);
  const replacementNode = createReplacementNode(
    path,
    processResult as JSXElementResult,
    templateId
  );

  path.replaceWith(replacementNode);
}
