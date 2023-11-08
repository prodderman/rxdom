import {
  Observable,
  Property,
  Subscription,
  observerNever,
  transact,
} from '@frp-dom/reactive-core';

export interface Context {
  disposing: boolean;
  propertiesSubscriptions: Set<Subscription>;
  effectsDisposers: Set<Subscription>;
  children: Set<Context>;
}

export function createContext(): Context {
  return {
    disposing: false,
    propertiesSubscriptions: new Set(),
    effectsDisposers: new Set(),
    children: new Set(),
  };
}

let isUpdating = false;
const contextsToDispose = new Set<Context>();
const effectsQueue: Map<Context, Observable<never>[]> = new Map();
export const renderQueue = new Map<
  (context: Context) => void,
  [Context, Context]
>();

function runFlow(initiator: boolean) {
  if (initiator) {
    isUpdating = true;

    // Disposing
    if (contextsToDispose.size > 0) {
      for (const context of contextsToDispose) {
        contextsToDispose.delete(context);
        disposeContext(context);
      }
    }

    // Render
    if (renderQueue.size > 0) {
      let iterations = renderQueue.size;
      for (const [render, [parentContext, context]] of renderQueue) {
        renderQueue.delete(render);
        iterations--;

        if (parentContext.children.has(context)) render(context);

        if (iterations === 0) break;
      }
    }

    // If state changed while rendering
    if (renderQueue.size > 0) return runFlow(initiator);

    // Effects
    if (effectsQueue.size > 0) {
      for (const [context, effects] of effectsQueue) {
        effectsQueue.delete(context);

        if (!context.disposing && effects.length > 0) {
          for (const effect of effects) {
            transact(() =>
              context.effectsDisposers.add(effect.subscribe(observerNever))
            );
          }
        }
      }
    }

    // If state changed during effects running
    if (renderQueue.size > 0) return runFlow(initiator);

    isUpdating = false;
  }
}

export function createReactiveNode(
  parentContext: Context,
  property: Property<unknown>,
  render: (context: Context) => void
) {
  const thisContext = createContext();
  parentContext.children.add(thisContext);
  renderQueue.set(render, [parentContext, thisContext]);

  let subscribing = true;
  parentContext.propertiesSubscriptions.add(
    property.subscribe({
      next: () => {
        if (subscribing) return;
        contextsToDispose.add(thisContext);
        renderQueue.set(render, [parentContext, thisContext]);
        runFlow(!isUpdating);
      },
    })
  );
  subscribing = false;

  runFlow(!isUpdating);
}

export function createEffectfulNode(
  context: Context,
  effect: Observable<never>
) {
  const effects = effectsQueue.get(context);
  if (effects) {
    effects.push(effect);
  } else {
    effectsQueue.set(context, [effect]);
  }
}

export function disposeContext(context: Context) {
  context.disposing = true;

  effectsQueue.delete(context);

  if (context.propertiesSubscriptions.size > 0) {
    for (const subscription of context.propertiesSubscriptions) {
      context.propertiesSubscriptions.delete(subscription);
      transact(() => subscription.unsubscribe());
    }
  }

  if (context.children.size > 0) {
    for (const childContext of context.children) {
      context.children.delete(childContext);
      if (!childContext.disposing) disposeContext(childContext);
    }
  }

  if (context.effectsDisposers.size > 0) {
    for (const effectDisposer of context.effectsDisposers) {
      context.effectsDisposers.delete(effectDisposer);
      transact(() => effectDisposer.unsubscribe());
    }
  }

  context.disposing = false;
}
