/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observer, Observable } from '../observable';

export interface Subject<A = unknown> extends Observable<A>, Observer<A> {
  observers: number;
}

let time = -1;
let batching = false;

const notificationQueue = new Map<(value: any) => void, any>();
export function batch<A>(fn: () => A): A {
  if (batching) return fn();

  batching = true;
  const result = fn();
  for (const [task, value] of notificationQueue) {
    notificationQueue.delete(task);
    task(value);
  }
  batching = false;
  return result;
}

export function batchFn<A>(fn: () => A): () => A {
  return function bachedFn() {
    return batch(fn);
  };
}

export function newSubject<A = any>(source: boolean = false): Subject<A> {
  const listeners = new Set<Observer<A>>();
  const pendingListeners = new Set<Observer<A>>();
  let subscriptionCount = 0;
  let lastTime = time;
  let notifying = false;

  const notify = (value: A) => {
    if (source) time++;

    if (source || lastTime !== time) {
      lastTime = time;

      if (listeners.size > 0) {
        notifying = true;
        for (const listener of listeners) listener.next(value);
        notifying = false;
      }

      if (pendingListeners.size > 0) {
        for (const addition of pendingListeners) {
          pendingListeners.delete(addition);
          listeners.add(addition);
        }
      }
    }
  };

  return {
    next(value) {
      if (batching) {
        notificationQueue.set(notify, value);
      } else {
        notify(value);
      }
    },
    subscribe(listener) {
      subscriptionCount++;

      if (notifying && !listeners.has(listener)) {
        pendingListeners.add(listener);
      } else {
        listeners.add(listener);
      }

      return {
        unsubscribe() {
          subscriptionCount--;
          pendingListeners.delete(listener);
          listeners.delete(listener);
        },
      };
    },
    get observers() {
      return subscriptionCount;
    },
  };
}
