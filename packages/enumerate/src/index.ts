import { Property } from '@frp-dom/reactive-core';

export interface Props<T extends unknown[]> {
  each: Property<T>;
  key: 'index' | 'value' | ((item: T[number]) => unknown);
  children: (item: Property<T[number]>) => unknown;
}

export function For<T extends unknown[]>(props: Props<T>) {
  //
}
