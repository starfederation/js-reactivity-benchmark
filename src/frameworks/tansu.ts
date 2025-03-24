import { batch, computed, writable } from "@amadeus-it-group/tansu";
import { ReactiveFramework } from "../util/reactiveFramework";

let toCleanup: (() => void)[] = [];
export const tansuFramework: ReactiveFramework = {
  type: "inline",
  name: "@amadeus-it-group/tansu",
  signal: (initialValue) => {
    const w = writable(initialValue);
    return {
      set value(v) {
        w.set(v);
      },
      get value() {
        return w();
      },
    };
  },
  computed: (_, fn) => {
    const c = computed(fn);
    return {
      get value() {
        return c();
      },
    };
  },
  effect: (_, fn) => toCleanup.push(computed(fn).subscribe(() => { })),
  withBatch: (fn) => batch(fn),
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup();
    }
    toCleanup = [];
  },
};
