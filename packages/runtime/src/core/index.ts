import {
  type Observable,
  type Property,
  Scheduler,
  Subscription,
  isProperty,
  newProperty,
  Observer,
} from '@frp-dom/reactive-core';
import type { JSX } from '../jsx-runtime';

export type Effect = Observable<never>;

export type Context = {
  property: boolean;
  disposer?: Subscription;
  children?: Set<Context>;
};

export function createContext(
  property: boolean,
  parent: Context | null
): Context {
  const newContext = {
    property,
  };

  if (parent) {
    (parent.children ??= new Set()).add(newContext);
  }

  return newContext;
}

export function continueWithContext(context: Context, updater: unknown) {
  while (typeof updater === 'function') updater = updater(context);
  return updater as JSX.Element;
}

let isUpdating = false;
export const DOMUpdatesQueue = new Set<() => void>();
const effectsQueue = new Set<() => void>();

export function doReflow(initiator = !isUpdating): void {
  if (initiator) {
    isUpdating = true;

    if (DOMUpdatesQueue.size > 0) {
      let iterations = DOMUpdatesQueue.size;
      for (const reflow of DOMUpdatesQueue) {
        DOMUpdatesQueue.delete(reflow);
        iterations--;
        reflow();
        if (iterations === 0) break;
      }
    }

    if (effectsQueue.size > 0) {
      for (const effect of effectsQueue) {
        effectsQueue.delete(effect);
        effect();
      }
    }

    if (DOMUpdatesQueue.size > 0) return doReflow(initiator);

    isUpdating = false;
  }
}

export const reflowScheduler: Scheduler = {
  schedule(work) {
    // move the already queued work to the end of the reflow queue
    DOMUpdatesQueue.delete(work);
    DOMUpdatesQueue.add(work);

    // run reflows and effects
    doReflow();
  },
};

export const effectScheduler: Scheduler = {
  schedule(effect) {
    effectsQueue.add(effect);
  },
};

export function createReactiveNode(
  parentContext: Context,
  observable: Observable<unknown>,
  update: (context: Context) => any
) {
  const thisContext = createContext(true, parentContext);
  let initial = true;

  const work = () => {
    if (parentContext.children?.has(thisContext)) {
      initial = false;
      update(thisContext);
    }
  };

  thisContext.disposer = observable.subscribe({
    next: () => {
      if (initial) return;
      disposeContext(thisContext, false); // TODO: need to be scheduled?
      reflowScheduler.schedule(work);
    },
  });

  reflowScheduler.schedule(work);
}

export function disposeContext(context: Context, destroy: boolean) {
  if (destroy && context.property && context.disposer) {
    context.disposer.unsubscribe();
    delete context.disposer;
  }

  if (context.children && context.children.size > 0) {
    for (const childContext of context.children) {
      context.children.delete(childContext);
      disposeContext(childContext, true);
    }
    delete context.children;
  }

  if (!context.property && context.disposer) {
    context.disposer.unsubscribe();
    delete context.disposer;
  }
}
