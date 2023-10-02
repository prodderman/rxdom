import { Observable, Observer, Teardown } from '../observable';
import { scheduler } from '../scheduler';

export interface Subject<A> extends Observable<A>, Observer<A> {
  observed: boolean;
  observers: number;
  name: string;
}

export function create<A = void>(name = 'subject'): Subject<A> {
  const listeners = new Map<Observer<A>, Teardown>();
  const pendingAdditions = new Set<Observer<A>>();
  let lastTick = -1;
  let isNotifying = false;

  return {
    name,
    get observed() {
      return listeners.size > 0;
    },
    get observers() {
      return listeners.size;
    },
    next(value, ...extra) {
      scheduler.schedule(() => {
        isNotifying = true;
        if (listeners.size > 0) {
          for (const [listener, teardown] of listeners) {
            teardown?.();
            listeners.set(listener, listener.next(value, ...extra));
          }
        }
        isNotifying = false;

        if (pendingAdditions.size > 0) {
          for (const addition of pendingAdditions) listeners.set(addition);
          pendingAdditions.clear();
        }
      }, lastTick);
      lastTick = scheduler.now;
    },
    subscribe(listener) {
      if (isNotifying) {
        pendingAdditions.add(listener);
      } else {
        listeners.set(listener);
      }

      return {
        unsubscribe() {
          pendingAdditions.delete(listener);
          listeners.get(listener)?.call(undefined);
          listeners.delete(listener);
        },
      };
    },
  };
}

export const Subject = {
  new: create,
};
