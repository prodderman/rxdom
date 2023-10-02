export type Teardown = (() => void) | void;

export interface Observer<A = void, Extra extends unknown[] = []> {
  readonly next: (value: A, ...extra: Extra) => Teardown;
}

export interface Subscription {
  unsubscribe(): void;
}

export interface Observable<A> {
  subscribe(observer: Observer<A>): Subscription;
}

const subscriptionNone: Subscription = {
  unsubscribe: () => void 0,
};

const never: Observable<never> = {
  subscribe: () => subscriptionNone,
};

const merge = <A>(observables: readonly Observable<A>[]): Observable<A> => {
  if (observables.length === 0) {
    return never;
  }
  if (observables.length === 1) {
    return observables[0];
  }

  return {
    subscribe: (listener) => {
      const subscriptions = new Set<Subscription>();
      for (let idx = 0; idx < observables.length; idx++) {
        subscriptions.add(observables[idx].subscribe(listener));
      }

      const subscription: Subscription = {
        unsubscribe: () => {
          for (const sub of subscriptions) sub.unsubscribe();
        },
      };

      return subscription;
    },
  };
};

export const Observable = {
  merge,
  never,
  void: () => subscriptionNone,
  subscriptionNone,
};
