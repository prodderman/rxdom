import { Observable, Observer, Subscription } from '../observable';
import { Subject } from '../subject';

export const propertySymbol = Symbol('property');

export interface Property<A> extends Observable<A> {
  get: () => A;
  name: string;
  observers: number;
  [propertySymbol]: void;
}

function from<A>(
  name: string,
  get: () => A,
  getObservers: () => number,
  subscribe: (observer: Observer<A>) => Subscription
): Property<A> {
  return {
    name,
    get observers() {
      return getObservers();
    },
    get,
    subscribe,
    [propertySymbol]: void 0,
  };
}

export type PropertyValue<Target> = Target extends Property<infer A>
  ? A
  : never;

export type MapPropertiesToValues<Target extends Property<unknown>[]> = {
  [Index in keyof Target]: PropertyValue<Target[Index]>;
};

function map<A, B>(property: Property<A>, project: (a: A) => B): Property<B>;
function map<A, B>(
  name: string,
  property: Property<A>,
  project: (a: A) => B
): Property<B>;
function map<A, B>(...args: unknown[]): Property<B> {
  const t = typeof args[0] === 'string';
  const name = t ? (args[0] as string) : 'anonymous';
  const target = (t ? args[1] : args[0]) as Property<A>;
  const get = memoizePropertyProject(
    (t ? args[2] : args[1]) as (a: A) => B,
    target
  );

  const subscribe = (listener: Observer<B>) => {
    let lastValue = get();
    const subscription = target.subscribe({
      next: () => {
        const nextValue = get();
        if (nextValue !== lastValue) {
          lastValue = nextValue;
          listener.next(nextValue);
        }
      },
    });

    return subscription;
  };

  return from(name, get, () => target.observers, subscribe);
}

const combine = <Properties extends Property<unknown>[], Result>(
  ...args: [
    string,
    ...Properties,
    (...values: [...MapPropertiesToValues<Properties>]) => Result
  ]
): Property<Result> => {
  const name = args[0] as string;
  const project = args[args.length - 1] as (
    ...values: readonly unknown[]
  ) => Result;
  const properties: Properties = args.slice(1, args.length - 1) as never;
  const subject = Subject.new<Result>(name);
  const merged = Observable.merge(properties);
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
    if (!subject.observed && outerSubscription) {
      outerSubscription.unsubscribe();
      outerSubscription = undefined;
    }
  };

  const subscribe = (listener: Observer<Result>): Subscription => {
    lastValue = get();
    const inner = subject.subscribe(listener);
    if (subject.observed && !outerSubscription) {
      outerSubscription = merged.subscribe(observer);
    }
    return {
      unsubscribe() {
        inner.unsubscribe();
        outerDisposer();
      },
    };
  };

  return from(name, get, () => subject.observers, subscribe);
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

function memoizePropertyProject<A, R>(
  project: (arg: A) => R,
  property: Property<A>
): () => R {
  let lastValue: A;
  let lastResult: R;

  return () => {
    const nextValue = property.get();
    if (!lastResult || !Object.is(lastValue, nextValue)) {
      lastValue = nextValue;
      lastResult = project(nextValue);
    }

    return lastResult;
  };
}

const is = (entity: unknown): entity is Property<unknown> =>
  typeof entity === 'object' && entity !== null && propertySymbol in entity;

export const Property = {
  from,
  combine,
  map,
  is,
};
