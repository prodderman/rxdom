import { type Observable, type Scheduler } from '@frp-dom/reactive-core';
import type { JSX } from '../jsx-runtime';

export type Effect = Observable<never>;

export type Context = Set<() => void>;

export function continueWithContext(context: Context, updater: unknown) {
  while (typeof updater === 'function') updater = updater(context);
  return updater as JSX.Element;
}

let isUpdating = false;
const renderQueue = new Set<() => void>();
const effectsQueue = new Set<() => void>();

export function runFlow(initiator = !isUpdating): void {
  if (initiator) {
    isUpdating = true;

    if (renderQueue.size > 0) {
      for (const update of renderQueue) {
        renderQueue.delete(update);
        update();
      }
    }

    performance.mark('run effects');

    if (effectsQueue.size > 0) {
      for (const effect of effectsQueue) {
        effectsQueue.delete(effect);
        effect();
      }
    }

    if (renderQueue.size > 0) return runFlow(initiator);

    isUpdating = false;
  }
}

export const updateScheduler: Scheduler = {
  schedule(work) {
    // move the already queued work to the end of the reflow queue
    renderQueue.delete(work);
    renderQueue.add(work);

    // run updates and effects
    runFlow();
  },
};

export const effectScheduler: Scheduler = {
  schedule(effect) {
    effectsQueue.add(effect);
  },
};

export function createRootNode(render: (context: Context) => any) {
  let alive = true;
  const thisContext: Context = new Set();

  const work = () => {
    if (alive) {
      render(thisContext);
    }
  };

  updateScheduler.schedule(work);

  return () => {
    alive = false;
    disposeContext(thisContext);
  };
}

export function insertReactiveNode(
  parentContext: Context,
  observable: Observable<any>,
  result: any,
  render: (context: Context, renderResult: any) => any
): () => any {
  let alive = true;
  const thisContext: Context = new Set();

  const work = () => {
    if (alive) {
      result = render(thisContext, result);
    }
  };

  let subscribed = false;
  const subscription = observable.subscribe({
    next: () => {
      if (subscribed) {
        disposeContext(thisContext); // TODO: need to be scheduled?
        updateScheduler.schedule(work);
      }
    },
  });

  parentContext.add(() => {
    alive = false;
    subscription.unsubscribe();
    disposeContext(thisContext);
  });
  subscribed = true;

  updateScheduler.schedule(work);

  return () => result;
}

export function disposeContext(context: Context) {
  for (const dispose of context) {
    context.delete(dispose);
    dispose();
  }
}
