/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observer, Observable } from '../observable';

export interface Subject<A = unknown> extends Observable<A>, Observer<A> {
  observers: number;
}

let time = -1;
let transacting = false;

export function now() {
  return time;
}

const taskQueue = new Map<(value: any) => void, any>();
export function transact<A>(fn: () => A): A {
  if (transacting) {
    return fn();
  }

  transacting = true;
  const result = fn();
  for (const [task, value] of taskQueue) {
    taskQueue.delete(task);
    task(value);
  }
  transacting = false;
  return result;
}

export function newSubject<A = unknown>(
  source: boolean,
  initial?: A
): Subject<A> {
  const listeners = new Set<Observer<A>>();
  const pendingListeners = new Set<Observer<A>>();
  let subscriptionCount = 0;
  let lastTime = time;
  let lastValue = initial;
  let notifying = false;

  const notify = (value: A) => {
    if (lastValue !== value && lastTime !== (source ? ++time : time)) {
      lastTime = time;
      lastValue = value;

      if (listeners.size > 0) {
        notifying = true;
        for (const listener of listeners) {
          listener.next(value);
        }
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
      if (transacting) {
        taskQueue.set(notify, value);
      } else {
        notify(value);
      }
    },
    subscribe(listener) {
      subscriptionCount++;

      if (notifying) {
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
