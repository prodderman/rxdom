import { Observable, Observer, Subscription } from './observable';

export interface Scheduler {
  schedule<T>(work: (...args: T[]) => void, ...args: T[]): void;
}

export function observeOn<T>(
  observable: Observable<T>,
  scheduler: Scheduler
): Observable<T> {
  return {
    subscribe(observer) {
      let subscribed = false;
      const subscription = observable.subscribe({
        next(value) {
          if (subscribed) {
            scheduler.schedule(() => observer.next(value));
          }
        },
      });
      subscribed = true;
      return subscription;
    },
  };
}

export function subscribeOn<T>(
  observable: Observable<T>,
  scheduler: Scheduler
): Observable<T> {
  const subscribe = (observer: Observer<unknown>): Subscription => {
    let subscription: Subscription;
    let disposed = false;

    scheduler.schedule(() => {
      if (!disposed) {
        subscription = observable.subscribe(observer);
      }
    });

    return {
      unsubscribe() {
        disposed = true;
        subscription?.unsubscribe();
      },
    };
  };

  return {
    subscribe,
  };
}
