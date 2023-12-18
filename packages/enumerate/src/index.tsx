import { type Property } from '@frp-dom/reactive-core';
import { iterateList, type JSX } from '@frp-dom/runtime';

export interface Props<T> {
  each: Property<Iterable<T>>;
  children: (item: Property<T>, index: number) => JSX.Element;
}

export function Iterate<T>({ each, children }: Props<T>) {
  return iterateList(each, children);
}
