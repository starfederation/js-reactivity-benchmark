import { batch, computed, effect, signal } from "@preact/signals";
import { ReactiveFramework } from "../util/reactiveFramework";

let toCleanup: (() => void)[] = [];
export const preactSignalFramework: ReactiveFramework = {
  type: "inline",
  name: "Preact Signals",
  signal: (initialValue) => {
    const s = signal(initialValue);
    return s;
  },
  computed: (_, fn) => {
    const c = computed(fn);
    return c;
  },
  effect: (_, fn) => toCleanup.push(effect(fn)),
  withBatch: (fn) => batch(fn),
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup();
    }
    toCleanup = [];
  },
};
