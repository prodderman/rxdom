export interface Observer<A> {
  readonly next: (value: A) => void;
}

export interface Subscription {
  unsubscribe(): void;
}

export interface Observable<A> {
  subscribe(observer: Observer<A>): Subscription;
}

export const subscriptionNever: Subscription = {
  unsubscribe: () => void 0,
};

export const observerNever: Observer<never> = {
  next: () => void 0,
};

export const observableNever: Observable<never> = {
  subscribe: () => subscriptionNever,
};

export const merge = <A>(
  observables: readonly Observable<A>[]
): Observable<A> => {
  if (observables.length === 0) {
    return observableNever;
  }

  if (observables.length === 1) {
    return observables[0];
  }

  return {
    subscribe: (listener) => {
      const subscriptions = Array(observables.length);
      for (let idx = 0; idx < observables.length; idx++) {
        subscriptions[idx] = observables[idx].subscribe(listener);
      }

      return {
        unsubscribe: () => {
          for (const sub of subscriptions) sub.unsubscribe();
        },
      };
    },
  };
};
