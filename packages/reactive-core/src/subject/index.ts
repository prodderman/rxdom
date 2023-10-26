import { scheduler } from '../scheduler';
import { Observer, Subscripable } from '../subscription';

export interface Subject<A> extends Subscripable<A>, Observer<A> {
  observers: number;
}

export function create<A = void>(): Subject<A> {
  const listeners = new Set<Observer<A>>();
  const pendingAdditions = new Set<Observer<A>>();
  let lastTick = -1;
  let isNotifying = false;

  return {
    next(value, ...extra) {
      scheduler.schedule(() => {
        isNotifying = true;
        if (listeners.size > 0) {
          for (const listener of listeners) {
            listener.next(value, ...extra);
          }
        }
        isNotifying = false;

        if (pendingAdditions.size > 0) {
          for (const addition of pendingAdditions) listeners.add(addition);
          pendingAdditions.clear();
        }
      }, lastTick);
      lastTick = scheduler.now;
    },
    subscribe(listener) {
      if (isNotifying) {
        pendingAdditions.add(listener);
      } else {
        listeners.add(listener);
      }

      return {
        unsubscribe() {
          pendingAdditions.delete(listener);
          listeners.delete(listener);
        },
      };
    },
    get observers() {
      return listeners.size;
    },
  };
}

export const Subject = {
  new: create,
};
