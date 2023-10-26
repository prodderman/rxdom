import type { Observer, Property } from '@frp-dom/reactive-core';
import { getCurrentContext, newContext, runInContext } from '../context';

export function bindProperty(property: Property<any>, effect: () => void) {
  const parentContext = getCurrentContext();
  const thisContext = newContext();

  const dispose = () => {
    if (thisContext.subscriptions.size > 0) {
      for (const subscription of thisContext.subscriptions) {
        thisContext.subscriptions.delete(subscription);
        subscription.unsubscribe();
      }
    }
  };

  const observer: Observer<any> = {
    next: () => {
      dispose();
      runInContext(thisContext, effect, parentContext);
    },
  };

  /**
   * @TODO schedule subscriptions so that they fire after DOM manipulations
   */
  const thisSubscription = property.subscribe(observer);
  thisSubscription.add(dispose);
  parentContext.subscriptions.add(thisSubscription);

  runInContext(thisContext, effect, parentContext);
}
