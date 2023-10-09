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

export interface Meta<M> {
  get meta(): M;
}

export type PropertyMeta = { name: string; observers: number };

const propertySymbol = Symbol('property');
const EMPTY_META = { name: 'anonym property', observers: 0 };

export interface Property<A> extends Subscripable<A>, Meta<PropertyMeta> {
  get(): A;
  subscribe(observer: Observer<A>): Subscription;
  [propertySymbol]: void;
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

export function propertyFrom<A>(
  get: () => A,
  subscribe: (observer: Observer<A>) => SubscriptionLike,
  getMeta?: () => PropertyMeta
): Property<A> {
  return {
    get,
    subscribe: (listener) => newSubscription(subscribe(listener)),
    get meta() {
      return getMeta?.() ?? EMPTY_META;
    },
    [propertySymbol]: void 0,
  };
}

export const isProperty = (entity: unknown): entity is Property<unknown> =>
  typeof entity === 'object' && entity !== null && propertySymbol in entity;

export const $ = propertyFrom;
