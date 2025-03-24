import { ReactiveFramework } from "../util/reactiveFramework";
// @ts-ignore
import * as $ from "svelte/internal/client";

// NOTE: The svelte adapter uses private, internal APIs that are usually only
// used by the Svelte compiler and client runtime. The Svelte team has made the
// decision to not expose these APIs publicly / officially, because it gives
// them more freedom to experiment without making breaking changes, but given
// that Svelte's v5 reactivity API is one of the most actively developed and
// efficient TS implementations available, I wanted to include it in the
// benchmark suite regardless.

export const svelteFramework: ReactiveFramework = {
  type: "inline",
  name: "Svelte v5",
  signal: (initialValue) => {
    const s = $.state(initialValue);
    return {
      get value() {
        return $.get(s);
      },
      set value(v) {
        $.set(s, v);
      },
    };
  },
  computed: (_, fn) => {
    const c = $.derived(fn);
    return {
      get value() {
        return $.get(c);
      },
    };
  },
  effect: (_, fn) => {
    $.render_effect(fn);
  },
  withBatch: (fn) => $.flush(fn),
  withBuild: <T>(fn: () => T): T => {
    let res: T | undefined;
    svelteFramework.cleanup = $.effect_root(() => {
      res = fn();
    });
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return res!;
  },
  cleanup: () => { },
};
