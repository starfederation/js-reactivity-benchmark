import {
  computed,
  effect,
  endBatch,
  signal,
  startBatch,
} from "alien-signals/esm";
import { ReactiveFramework } from "../util/reactiveFramework";

let toCleanup: (() => void)[] = [];

export const alienFramework: ReactiveFramework = {
  type: "inline",
  name: "alien-signals",
  signal: (initial) => {
    const data = signal(initial);
    return {
      get value() {
        return data();
      },
      set value(v) {
        data(v);
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
  effect: (_, fn) => toCleanup.push(effect(fn)),
  withBatch: (fn) => {
    startBatch();
    fn();
    endBatch();
  },
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup();
    }
    toCleanup = [];
  },
};
