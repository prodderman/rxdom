import { Property, map, newProperty } from '@frp-dom/reactive-core';

import type { JSX } from '../jsx-runtime';
import {
  type Context,
  continueWithContext,
  createContext,
  disposeContext,
} from '../core';
import { Observer } from 'packages/reactive-core/build';

export function mapListByIndex<T>(
  list: Property<T[]>,
  project: (item: Property<T>, index: number) => JSX.Element
) {
  return (parentContext: Context) => {
    let items: T[] = [],
      mapped: JSX.Element[] = [],
      properties: Property<T>[] = [],
      contexts: Context[] = [],
      targetLength = 0,
      idx: number;

    function get() {
      const newItems = list.get();
      if (items !== newItems) {
        const newLength = newItems.length;

        if (newLength === 0 && targetLength !== 0) {
          for (idx = 0; idx < newLength; idx++) {
            disposeContext(contexts[idx], true);
          }

          items = newItems;
          mapped = [];
          targetLength = 0;
          return mapped;
        }

        for (idx = 0; idx < newLength; idx++) {
          if (idx >= items.length) {
            mapped[idx] = projectWithContext(idx);
          }
        }

        for (; idx < items.length; idx++) {
          disposeContext(contexts[idx], true);
        }

        items = newItems;
        targetLength = properties.length = newItems.length;
        return (mapped = mapped.slice(0, targetLength));
      }

      return mapped;
    }

    function projectWithContext(idx: number) {
      const newContext = (contexts[idx] = createContext(false, parentContext));
      const getByIndex = () => list.get()[idx];
      const mapped = project(
        newProperty(getByIndex, (observer) => {
          let last = getByIndex();
          return list.subscribe({
            next: () => {
              if (last !== (last = getByIndex())) {
                observer.next(last);
              }
            },
          });
        }),
        idx
      );

      return continueWithContext(newContext, mapped);
    }

    function subscribe(observer: Observer<unknown>) {
      let lastValue = get();
      return list.subscribe({
        next: () => {
          if (lastValue !== (lastValue = get())) {
            observer.next(void 0);
          }
        },
      });
    }

    return newProperty(get, subscribe);
  };
}

export function mapListByValue<T>(
  project: (
    item: T /* TODO: implement dynamic indices -> index: Property<number> */
  ) => JSX.Element,
  list: Property<T[]>
): Property<JSX.Element[]> {
  let items: T[] = [],
    mapped: JSX.Element[] = [],
    targetLength = 0,
    contexts: Context[] = [];

  function get() {
    const newItems = list.get();
    if (items !== newItems) {
      const newLength = newItems.length;

      if (newLength === 0 && targetLength !== 0) {
        for (const context of contexts) {
          disposeContext(context, true);
        }
        contexts = [];
        items = newItems;
        mapped = [];
        targetLength = 0;
      } else if (targetLength === 0) {
        mapped = new Array(newLength);
        contexts = new Array(newLength);
        for (let idx = 0; idx < newLength; idx++) {
          mapped[idx] = projectWithContext(newItems, idx);
        }
        targetLength = newLength;
        items = newItems;
      } else {
        throw new Error('Not implemented');
      }
    }

    return mapped;
  }

  function projectWithContext(items: T[], idx: number) {
    const newContext = (contexts[idx] = createContext(false, null));
    // TODO: don't forget properties
    return continueWithContext(newContext, project(items[idx]));
  }

  function subscribe(observer: Observer<unknown>) {
    let lastValue = get();
    let subscribing = true;
    const subscription = list.subscribe({
      next: () => {
        if (!subscribing && lastValue !== (lastValue = get())) {
          observer.next(void 0);
        }
      },
    });
    subscribing = false;
    return {
      unsubscribe() {
        for (const context of contexts) {
          disposeContext(context, true);
        }
        contexts = [];
        items = [];
        mapped = [];
        subscription.unsubscribe();
      },
    };
  }

  return newProperty(get, subscribe);
}
