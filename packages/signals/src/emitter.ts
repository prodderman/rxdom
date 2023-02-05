import { Tick } from './clock';
import type { Observable, Observer } from './observable';

export interface Emitter extends Observer<Tick>, Observable<Tick> {}

export const mkEmitter = (): Emitter => {
  let lastTick: Tick | undefined = undefined;
  let isNotifying = false;
  const observers = new Set<Observer<Tick>>();
  let pendingObserves: Observer<Tick>[] = [];

  return {
    next: (tick) => {
      if (lastTick !== tick) {
        lastTick = tick;

        isNotifying = true;
        if (observers.size === 0) return;
        for (const listener of observers) {
          listener.next(tick);
        }
        isNotifying = false;

        if (pendingObserves.length > 0) {
          for (const listener of pendingObserves) {
            observers.add(listener);
          }

          pendingObserves = [];
        }
      }
    },
    subscribe: (observer) => {
      if (isNotifying) {
        pendingObserves.push(observer);
      } else {
        observers.add(observer);
      }
      return {
        unsubscribe: () => {
          observers.delete(observer);
        },
      };
    },
  };
};
