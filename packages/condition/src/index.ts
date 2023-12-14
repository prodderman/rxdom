import type { JSX } from '@frp-dom/runtime';
import { isProperty, map } from '@frp-dom/reactive-core';

export type ConditionProps = {
  if: unknown;
  then: JSX.Element;
  else?: JSX.Element;
};

export function Cond(props: ConditionProps) {
  return isProperty(props.if)
    ? map(props.if, (condition) => (condition ? props.then : props.else))
    : props.if
    ? props.then
    : props.else;
}
