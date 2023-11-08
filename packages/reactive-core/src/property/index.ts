import {
  merge,
  type Observable,
  type Observer,
  type Subscription,
} from '../observable';
import { newSubject } from '../subject';

const propertySymbol = Symbol('property');

export interface Property<A> extends Observable<unknown> {
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
    [propertySymbol]: void 0,
  };
}

export function map<A, B>(
  property: Property<A>,
  project: (a: A) => B
): Property<B> {
  const get = memoizePropertyProject(project, property);
  let lastValue: B;

  const subscribe = (observer: Observer<unknown>) => {
    lastValue = get();
    return property.subscribe({
      next: () => {
        const nextValue = get();
        if (nextValue !== lastValue) {
          lastValue = nextValue;
          observer.next(nextValue);
        }
      },
    });
  };

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
  const subject = newSubject(false);
  const merged = merge(properties);
  const get = memoizePropertiesProject(project, properties);

  let outerSubscription: Subscription | undefined;
  let lastValue: Result | undefined = undefined;

  const observer: Observer<unknown> = {
    next: () => {
      const nextValue = get();
      if (nextValue !== lastValue) {
        lastValue = nextValue;
        subject.next(nextValue);
      }
    },
  };

  const outerDisposer = () => {
    if (subject.observers === 0 && outerSubscription) {
      outerSubscription.unsubscribe();
      outerSubscription = undefined;
    }
  };

  const subscribe = (listener: Observer<unknown>): Subscription => {
    lastValue = get();
    const inner = subject.subscribe(listener);
    if (!outerSubscription && subject.observers > 0) {
      outerSubscription = merged.subscribe(observer);
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

function memoizePropertiesProject<R>(
  project: (...args: unknown[]) => R,
  properties: Property<unknown>[]
): () => R {
  const values = Array(properties.length);
  let memoized: R | undefined = undefined;

  return () => {
    let changed = memoized === undefined;
    for (let i = 0; i < properties.length; i++) {
      const propertyValue = properties[i].get();
      if (!Object.is(values[i], propertyValue)) {
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

function memoizePropertyProject<A, R>(
  project: (arg: A) => R,
  property: Property<A>
): () => R {
  let lastValue: A;
  let lastResult: R;

  return () => {
    const nextValue = property.get();
    if (!lastResult || lastValue !== nextValue) {
      lastValue = nextValue;
      lastResult = project(nextValue);
    }

    return lastResult;
  };
}
