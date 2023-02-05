import { Tick } from './clock';
import { memo1 } from './function';
import {
  observableSymbol,
  interopObservable,
  InteropObservableHolder,
} from './interop-observable';
import type { Observer, Observable, Subscription } from './observable';

export const propertySymbol = Symbol('property');

export interface Property<T>
  extends Observable<Tick>,
    InteropObservableHolder<T> {
  readonly get: () => T;
  [propertySymbol]: symbol;
}

export const property = <A>(
  get: () => A,
  subscribe: (observer: Observer<Tick>) => Subscription
): Property<A> => ({
  get,
  subscribe,
  [observableSymbol]: () => interopObservable(get, subscribe),
  [propertySymbol]: propertySymbol,
});

export const map = <T, R>(fa: Property<T>, f: (v: T) => R) => {
  const memoF = memo1(f);
  const get = () => memoF(fa.get());
  return property(get, fa.subscribe);
};

export const isProperty = (entity: unknown): entity is Property<unknown> =>
  entity !== null && typeof entity === 'object' && propertySymbol in entity;
