import type { JSX } from './jsx';
export type { JSX } from './jsx';

function h() {
  throw new Error("don't use jsx-runtime");
}

function Fragment(props: { children: JSX.Element }) {
  return props.children;
}

export { h as jsx, h as jsxs, h as jsxDEV, Fragment };
