export interface Observer<A = void, Extra extends unknown[] = []> {
  readonly next: (value: A, ...extra: Extra) => void;
}

export type Unsubscribable = Subscription | SubscriptionLike | (() => void);

export interface SubscriptionLike {
  unsubscribe(): void;
}

export interface Subscription extends SubscriptionLike {
  add(disposer: Unsubscribable): void;
}

export interface Subscripable<A> {
  subscribe(observer: Observer<A>): SubscriptionLike;
}

function runDisposer(disposer: Unsubscribable) {
  if (typeof disposer === 'function') {
    disposer();
  } else {
    disposer.unsubscribe();
  }
}

export function newSubscription(
  initialTeardown?: Unsubscribable
): Subscription {
  let additionalDisposers: Set<Unsubscribable> | undefined = undefined;
  let disposed = false;

  return {
    unsubscribe() {
      if (!disposed) {
        if (initialTeardown) {
          runDisposer(initialTeardown);
        }

        if (additionalDisposers) {
          for (const disposer of additionalDisposers) {
            runDisposer(disposer);
          }
          additionalDisposers = undefined;
        }
        disposed = true;
      }
    },
    add(disposer) {
      if (disposed) {
        runDisposer(disposer);
      } else {
        (additionalDisposers ??= new Set()).add(disposer);
        if ('add' in disposer) {
          disposer.add(() => additionalDisposers?.delete(disposer));
        }
      }
    },
  };
}
