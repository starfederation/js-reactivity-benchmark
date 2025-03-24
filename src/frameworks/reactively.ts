import { Reactive, stabilize } from "@reactively/core";
import { ReactiveFramework } from "../util/reactiveFramework";

export const reactivelyFramework: ReactiveFramework = {
  type: "inline",
  name: "@reactively",
  signal: (initialValue) => {
    const r = new Reactive(initialValue);
    return {
      set value(v) {
        r.set(v);
      },
      get value() {
        return r.get();
      },
    };
  },
  computed: (_, fn) => {
    const r = new Reactive(fn);
    return {
      get value() {
        return r.get();
      },
    };
  },
  effect: (_, fn) => new Reactive(fn, true),
  withBatch: (fn) => {
    fn();
    stabilize();
  },
  withBuild: (fn) => fn(),
  cleanup: () => {
    // TODO: reactively doesn't support cleaning up effects yet
  },
};
