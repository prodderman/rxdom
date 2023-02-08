declare module '@babel/plugin-syntax-jsx';

declare module '@babel/helper-module-imports' {
  import type { NodePath } from '@babel/core';
  import type { Identifier } from '@babel/types';

  type Options = {
    nameHint: string;
  };

  export function addNamed(
    path: NodePath,
    name: string,
    source: string,
    options?: Options
  ): Identifier;
  export function addDefault(
    path: NodePath,
    source: string,
    options?: Options
  ): Identifier;
  export function addNamespace(path: NodePath, source: string): Identifier;
  export function addSideEffect(path: NodePath, source: string): Identifier;
}
