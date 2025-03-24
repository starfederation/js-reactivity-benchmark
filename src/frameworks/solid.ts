import {
  batch,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
} from "solid-js/dist/solid.cjs";
import { ReactiveFramework } from "../util/reactiveFramework";

export const solidFramework: ReactiveFramework = {
  type: "inline",
  name: "SolidJS",
  signal: <T>(initialValue: T) => {
    const [getter, setter] = createSignal(initialValue);
    return {
      set value(v) {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        setter(v as any);
      },
      get value() {
        return getter();
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
  effect: (_, fn) => createEffect(fn),
  withBatch: (fn) => batch(fn),
  withBuild: (fn) =>
    createRoot((dispose) => {
      solidFramework.cleanup = dispose;
      return fn();
    }),
  cleanup: () => { },
};
