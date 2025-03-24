import { Signal } from "signal-polyfill";
import { ReactiveFramework } from "../util/reactiveFramework";

let toCleanup: (() => void)[] = [];

export const tc39SignalsFramework: ReactiveFramework = {
  type: "inline",
  name: "TC39 Signals Polyfill",
  signal: (initialValue) => {
    const s = new Signal.State(initialValue);
    return {
      get value() {
        return s.get();
      },
      set value(v) {
        s.set(v);
      },
    };
  },
  computed: (_, fn) => {
    const c = new Signal.Computed(fn);
    return {
      get value() {
        return c.get();
      },
    };
  },
  effect: (_, fn) => effect(fn),
  withBatch: (fn) => {
    fn();
    processPending();
  },
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup();
    }
    toCleanup = [];
  },
};

let needsEnqueue = false;

const w = new Signal.subtle.Watcher(() => {
  if (needsEnqueue) {
    needsEnqueue = false;
    (async () => {
      await Promise.resolve();
      // next micro queue
      processPending();
    })();
  }
});

function processPending() {
  needsEnqueue = true;

  for (const s of w.getPending()) {
    s.get();
  }

  w.watch();
}

export function effect(callback: any) {
  const computed = new Signal.Computed(() => callback());

  w.watch(computed);
  computed.get();

  toCleanup.push(() => w.unwatch(computed));
}
