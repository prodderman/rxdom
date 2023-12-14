import { type Property } from '@frp-dom/reactive-core';
import { mapListByIndex, type JSX } from '@frp-dom/runtime';

export interface Props<T> {
  each: Property<T[]>;
  children: (item: Property<T>, index: number) => JSX.Element;
}

export function For<T>({ each, children }: Props<T>) {
  return mapListByIndex(each, children);
}
