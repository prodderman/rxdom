import { Tick } from './clock';

declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}

export interface Subscription {
  readonly unsubscribe: () => void;
}

export interface Observer<T> {
  next(value: T): void;
}

export interface Observable<T> {
  readonly subscribe: (observer: Observer<T>) => Subscription;
}

export const newObservable = <A>(
  f: (observer: Observer<A>) => () => void
): Observable<A> => ({
  subscribe: (observer) => ({
    unsubscribe: f(observer),
  }),
});

export const EMPTY_SUBSCRIPTION: Subscription = {
  unsubscribe: () => void 0,
};

export const never: Observable<never> = {
  subscribe: () => EMPTY_SUBSCRIPTION,
};

export const mergeMany = (
  observables: readonly Observable<Tick>[]
): Observable<Tick> => {
  if (observables.length === 0) {
    return never;
  }
  if (observables.length === 1) {
    return observables[0];
  }
  let lastNotifiedTick: Tick | undefined;
  return {
    subscribe: (listener) => {
      const observer: Observer<Tick> = {
        next: (t) => {
          if (t !== lastNotifiedTick) {
            lastNotifiedTick = t;
            listener.next(t);
          }
        },
      };

      const subscriptions = observables.map((observable) =>
        observable.subscribe(observer)
      );
      return {
        unsubscribe: () => {
          for (const subscription of subscriptions) subscription.unsubscribe();
        },
      };
    },
  };
};
