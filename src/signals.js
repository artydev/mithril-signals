import m from "mithril";

let currentEffect = null;
const effectStack = [];
let pendingRedraw = false;

/**
 * Batches redraws to the next animation frame.
 */
function scheduleRedraw() {
  if (pendingRedraw) return;
  pendingRedraw = true;
  requestAnimationFrame(() => {
    pendingRedraw = false;
    m.redraw();
  });
}

/**
 * SIGNAL: The basic state unit.
 */
export function signal(value) {
  const subscriptions = new Set();

  const fn = function(newValue) {
    // Getter
    if (arguments.length === 0) {
      if (currentEffect) {
        subscriptions.add(currentEffect);
        currentEffect.deps.add(subscriptions); 
      }
      return value;
    }

    // Setter
    if (!Object.is(value, newValue)) {
      value = newValue;
      // Snapshot to avoid issues if sets are modified during iteration
      const observers = [...subscriptions];
      for (const sub of observers) {
        // SAFETY: Re-entrancy guard
        // Do not trigger the effect that is currently executing
        if (sub !== currentEffect) {
          sub.run();
        }
      }
      scheduleRedraw();
    }
    return value;
  };

  /**
   * PEEK: Read the value without subscribing. 
   * Essential for updating a signal based on its previous value inside an effect.
   */
  fn.peek = () => value;

  return fn;
}

/**
 * EFFECT: Runs a function and re-runs it when dependencies change.
 */
export function effect(fn) {
  const effectState = {
    deps: new Set(),
    run() {
      // Cleanup old subscriptions (Dependency Tracking)
      for (const subSet of this.deps) {
        subSet.delete(this);
      }
      this.deps.clear();

      effectStack.push(currentEffect);
      currentEffect = this;
      try {
        return fn();
      } finally {
        currentEffect = effectStack.pop();
      }
    }
  };

  effectState.run();
  
  // Return a disposer
  return () => {
    for (const subSet of effectState.deps) {
      subSet.delete(effectState);
    }
    effectState.deps.clear();
  };
}

/**
 * COMPUTED: Derived state that only updates when its dependencies change.
 */
export function computed(fn) {
  let cachedValue;
  const internalSignal = signal();

  effect(() => {
    const newVal = fn();
    if (!Object.is(cachedValue, newVal)) {
      cachedValue = newVal;
      internalSignal(cachedValue); 
    }
  });

  return () => {
    internalSignal(); // Subscribe to the computed result
    return cachedValue;
  };
}

/**
 * BATCH: Group multiple updates into one redraw.
 */
export function batch(fn) {
  const wasPending = pendingRedraw;
  pendingRedraw = true; 
  try {
    fn();
  } finally {
    pendingRedraw = wasPending;
    scheduleRedraw();
  }
}