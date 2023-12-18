import {
  type Property,
  type Observer,
  newProperty,
  newSubject,
  batch,
  batchFn,
} from '@frp-dom/reactive-core';

import type { JSX } from '../jsx-runtime';
import { type Context, continueWithContext, disposeContext } from '../core';

export function iterateList<T>(
  list: Property<Iterable<T>>,
  project: (item: Property<T>, index: number) => JSX.Element
) {
  let currentItems: Iterable<T> = [],
    mapped: JSX.Element[] = [],
    observers: Observer<T>[] = [],
    contexts: Context[] = [],
    currentLength = 0;

  const get = batchFn(() => {
    const newItems = list.get();

    if (currentItems !== newItems) {
      const newListIterator = newItems[Symbol.iterator]();
      const currentListIterator = currentItems[Symbol.iterator]();
      let newItem = newListIterator.next();

      if (newItem.done) {
        if (currentLength !== 0) {
          for (const context of contexts) {
            disposeContext(context);
          }

          currentItems = newItems;
          contexts.length = observers.length = currentLength = 0;
          mapped = [];
        }
      } else {
        let idx = 0;
        let newLength = 0;
        let currentItem = currentListIterator.next();

        do {
          if (!currentItem.done && currentItem.value !== newItem.value) {
            observers[idx].next(newItem.value);
          } else if (idx >= currentLength) {
            mapped[idx] = projectWithContext(idx, newItem.value);
          }
          idx++;
          newLength++;
          currentItem = currentListIterator.next();
        } while (!(newItem = newListIterator.next()).done);

        for (; idx < currentLength; idx++) {
          disposeContext(contexts[idx]);
        }

        if (currentLength !== newLength) {
          currentLength = observers.length = contexts.length = newLength;
          mapped = mapped.slice(0, currentLength);
        }

        currentItems = newItems;
      }
    }

    return mapped;
  });

  function projectWithContext(idx: number, value: T) {
    const newContext = (contexts[idx] = new Set());
    const subject = (observers[idx] = newSubject());

    const mapped = project(
      newProperty(
        () => value,
        (observer) =>
          subject.subscribe({
            next(nextValue) {
              observer.next((value = nextValue));
            },
          })
      ),
      idx
    );

    return continueWithContext(newContext, mapped); // TODO: recursively subscribe to properties
  }

  function subscribe(observer: Observer<unknown>) {
    const subscription = list.subscribe(observer);

    return {
      unsubscribe() {
        subscription.unsubscribe();
        for (const context of contexts) disposeContext(context);
        contexts.length = 0;
      },
    };
  }

  return newProperty(get, subscribe);
}

// export function mapListByValue<T>(
//   project: (
//     item: T /* TODO: implement dynamic indices -> index: Property<number> */
//   ) => JSX.Element,
//   list: Property<T[]>
// ): Property<JSX.Element[]> {
//   let items: T[] = [],
//     mapped: JSX.Element[] = [],
//     targetLength = 0,
//     contexts: Context[] = [];

//   function get() {
//     const newItems = list.get();
//     if (items !== newItems) {
//       const newLength = newItems.length;

//       if (newLength === 0 && targetLength !== 0) {
//         for (const context of contexts) {
//           disposeContext(context, true);
//         }
//         contexts = [];
//         items = newItems;
//         mapped = [];
//         targetLength = 0;
//       } else if (targetLength === 0) {
//         mapped = new Array(newLength);
//         contexts = new Array(newLength);
//         for (let idx = 0; idx < newLength; idx++) {
//           mapped[idx] = projectWithContext(newItems, idx);
//         }
//         targetLength = newLength;
//         items = newItems;
//       } else {
//         throw new Error('Not implemented');
//       }
//     }

//     return mapped;
//   }

//   function projectWithContext(items: T[], idx: number) {
//     const newContext = (contexts[idx] = createContext(false, null));
//     // TODO: don't forget properties
//     return continueWithContext(newContext, project(items[idx]));
//   }

//   function subscribe(observer: Observer<unknown>) {
//     let lastValue = get();
//     let subscribing = true;
//     const subscription = list.subscribe({
//       next: () => {
//         if (!subscribing && lastValue !== (lastValue = get())) {
//           observer.next(void 0);
//         }
//       },
//     });
//     subscribing = false;
//     return {
//       unsubscribe() {
//         for (const context of contexts) {
//           disposeContext(context, true);
//         }
//         contexts = [];
//         items = [];
//         mapped = [];
//         subscription.unsubscribe();
//       },
//     };
//   }

//   return newProperty(get, subscribe);
// }
