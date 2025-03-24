import {
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  flushSync,
} from "@solidjs/signals";
import { ReactiveFramework } from "../util/reactiveFramework";

export const xReactivityFramework: ReactiveFramework = {
  type: "inline",
  name: "x-reactivity",
  signal: (initialValue) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const [getter, setter] = createSignal(initialValue as any);
    return {
      get value() {
        return getter();
      },
      set value(v) {
        setter(v);
      },
    };
  },
  computed: (_, fn) => {
    const memo = createMemo(fn);
    return {
      get value() {
        return memo();
      },
    };
  },
  effect: (_, fn) => createEffect(fn, () => { }),
  withBatch: (fn) => {
    fn();
    flushSync();
  },
  withBuild: (fn) =>
    createRoot((dispose) => {
      xReactivityFramework.cleanup = dispose;
      return fn();
    }),
  cleanup: () => { },
};
