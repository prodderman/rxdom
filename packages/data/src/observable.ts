import { SubscriptionLike, Subscripable } from '@frp-dom/reactive-core';

export const subscriptionNone: SubscriptionLike = {
  unsubscribe: () => void 0,
};

export const never: Subscripable<never> = {
  subscribe: () => subscriptionNone,
};

export const merge = <A>(
  observables: readonly Subscripable<A>[]
): Subscripable<A> => {
  if (observables.length === 0) {
    return never;
  }
  if (observables.length === 1) {
    return observables[0];
  }

  return {
    subscribe: (listener) => {
      const subscriptions = new Set<SubscriptionLike>();
      for (let idx = 0; idx < observables.length; idx++) {
        subscriptions.add(observables[idx].subscribe(listener));
      }

      const subscription: SubscriptionLike = {
        unsubscribe: () => {
          for (const sub of subscriptions) sub.unsubscribe();
        },
      };

      return subscription;
    },
  };
};
