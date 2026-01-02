
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
  declare interface effectStateType {}
