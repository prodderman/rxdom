/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InteropObservableHolder,
  newInteropObservable,
  observableSymbol,
} from '../interop-observable';
import {
  merge,
  type Observable,
  type Observer,
  type Subscription,
  subscriptionNever,
} from '../observable';
import { newSubject } from '../subject';

const propertySymbol = Symbol('property');

export interface Property<A>
  extends Observable<unknown>,
    InteropObservableHolder<A> {
  get(): A;
  [propertySymbol]: void;
}

export function newProperty<A>(
  get: () => A,
  subscribe: (observer: Observer<unknown>) => Subscription
): Property<A> {
  return {
    get,
    subscribe,
    [observableSymbol]: () => newInteropObservable(get, subscribe),
    [propertySymbol]: void 0,
  };
}

export function map<A, B>(
  target: Property<A>,
  project: (a: A) => B
): Property<B> {
  const get = memoPropertyProject(project, target);
  const subscribe = (observer: Observer<B>) =>
    target.subscribe(memoObserver(get, observer));

  return newProperty(get, subscribe);
}

export type PropertyValue<Target> = Target extends Property<infer A>
  ? A
  : never;

export type MapPropertiesToValues<Target extends Property<unknown>[]> = {
  [Index in keyof Target]: PropertyValue<Target[Index]>;
};

export const combine = <Properties extends Property<unknown>[], Result>(
  ...args: [
    ...Properties,
    (...values: [...MapPropertiesToValues<Properties>]) => Result
  ]
): Property<Result> => {
  const project = args[args.length - 1] as (
    ...values: readonly unknown[]
  ) => Result;
  const properties: Properties = args.slice(0, args.length - 1) as never;

  if (properties.length === 0) {
    return propertyNever;
  }

  if (properties.length === 1) {
    return map(properties[0], project);
  }

  const scheduler = newSubject(false);
  const merged = merge(properties);
  const get = memoPropertiesProject(project, properties);

  let outerSubscription: Subscription | undefined;

  const outerDisposer = () => {
    if (scheduler.observers === 0 && outerSubscription) {
      outerSubscription.unsubscribe();
      outerSubscription = undefined;
    }
  };

  const subscribe = (listener: Observer<unknown>): Subscription => {
    const inner = scheduler.subscribe(listener);
    if (!outerSubscription && scheduler.observers > 0) {
      outerSubscription = merged.subscribe(memoObserver(get, scheduler));
    }
    return {
      unsubscribe() {
        inner.unsubscribe();
        outerDisposer();
      },
    };
  };

  return newProperty(get, subscribe);
};

export function memoPropertyProject<A, B>(
  project: (value: A) => B,
  target: Property<A>
): () => B {
  let lastTargetValue: A;
  let lastResult: B;

  return () => {
    if (lastTargetValue !== (lastTargetValue = target.get())) {
      lastResult = project(lastTargetValue);
    }

    return lastResult;
  };
}

function memoPropertiesProject<R>(
  project: (...args: unknown[]) => R,
  properties: Property<unknown>[]
): () => R {
  const values = Array(properties.length);
  let memoized: R | undefined = undefined;

  return () => {
    let changed = memoized === undefined;
    for (let i = 0; i < properties.length; i++) {
      const propertyValue = properties[i].get();
      if (values[i] !== propertyValue) {
        values[i] = propertyValue;
        changed = true;
      }
    }

    if (changed) {
      // eslint-disable-next-line prefer-spread
      memoized = project.apply(undefined, values);
    }

    return memoized as R;
  };
}

export const isProperty = (entity: unknown): entity is Property<unknown> =>
  typeof entity === 'object' && entity !== null && propertySymbol in entity;

const propertyNever = newProperty<never>(
  () => void 0 as never,
  () => subscriptionNever
);

function memoObserver<T>(
  get: () => T,
  observer: Observer<unknown>
): Observer<unknown> {
  let lastValue = get();
  return {
    next(value) {
      if (lastValue !== (lastValue = get())) {
        observer.next(value);
      }
    },
  };
}
