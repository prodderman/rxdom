import { Subject } from './subject';
import {
  Observer,
  Subscripable,
  Subscription,
  SubscriptionLike,
  newSubscription,
} from './subscription';

export type { Observer, Subscripable, SubscriptionLike, Subscription };
export { scheduler } from './scheduler';

type PropertyMeta = {
  name?: string;
  observers: number;
  [propertySymbol]: void;
};

const propertySymbol = Symbol('property');

export interface Property<A> extends Subscripable<A>, PropertyMeta {
  get(): A;
  subscribe(observer: Observer<A>): Subscription;
}

export type PropertyArgs<A> = {
  get: () => A;
  subscribe?: (observer: Observer<A>) => SubscriptionLike;
  name?: string;
};

type PropertyValue<P> = P extends Property<infer V> ? V : never;

export function newProperty<A extends Property<unknown>>(
  ctor: (
    observer: Subject<PropertyValue<A>>
  ) => PropertyArgs<unknown> & Omit<A, keyof Property<PropertyValue<A>>>
): A {
  const observer = Subject.new<PropertyValue<A>>();
  const { subscribe = observer.subscribe, get, name, ...rest } = ctor(observer);

  return Object.assign<Property<unknown>, object>(
    {
      get,
      subscribe: (listener) => newSubscription(subscribe(listener)),
      name,
      get observers() {
        return observer.observers;
      },
      [propertySymbol]: void 0,
    },
    rest
  ) as A;
}

export const isProperty = (entity: unknown): entity is Property<unknown> =>
  typeof entity === 'object' && entity !== null && propertySymbol in entity;

export const $ = newProperty;
