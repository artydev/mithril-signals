import m from "mithril";
import { signal, computed, effect } from "./src/signals.js";

const count = signal(0);
const double = computed(() => count() * 2);
const logs = signal([]);

// --- FIXED SIDE EFFECT ---
effect(() => {
  const currentCount = count(); // We WANT to track count
  
  /**
   * We use .peek() here because we need the current logs to update them,
   * but we don't want this effect to RE-RUN every time 'logs' changes.
   * (Writing to a signal you are subscribed to causes recursion).
   */
  const currentLogs = logs.peek();
  
  const newLog = `Count is now: ${currentCount}`;
  logs([...currentLogs, newLog].slice(-5)); 
});

const Counter = {
  view: () => m("div", { style: "font-family: sans-serif; padding: 20px;" }, [
    m("h1", "Mithril Signals (Fixed)"),
    m("div", [
      m("p", ["Count: ", m("b", count())]),
      m("p", ["Double: ", m("b", double())])
    ]),
    m("button", { onclick: () => count(count() + 1) }, "Increment"),
    m("button", { 
      style: "margin-left: 10px",
      onclick: () => count(count() - 1) 
    }, "Decrement"),
    
    m("h3", "Recent Activity:"),
    m("ul", logs().map(l => m("li", l)))
  ])
};

m.mount(document.getElementById("app"), Counter);