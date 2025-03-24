import {
  computed,
  effect,
  EffectRef,
  Injector,
  signal,
  untracked,
  ɵChangeDetectionScheduler,
  ɵEffectScheduler,
} from "@angular/core";
import { ReactiveFramework } from "../util/reactiveFramework";

interface SchedulableEffect {
  run(): void;
}
export class ArrayEffectScheduler implements ɵEffectScheduler {
  private queue = new Set<SchedulableEffect>();

  schedule(handle: SchedulableEffect): void {
    this.enqueue(handle);
  }

  remove(handle: SchedulableEffect): void {
    if (!this.queue.has(handle)) {
      return;
    }

    this.queue.delete(handle);
  }

  private enqueue(handle: SchedulableEffect): void {
    if (this.queue.has(handle)) {
      return;
    }
    this.queue.add(handle);
  }

  flush(): void {
    for (const handle of this.queue) {
      this.queue.delete(handle);

      handle.run();
    }
  }
}

const scheduler = new ArrayEffectScheduler();
const injector = Injector.create({
  providers: [
    { provide: ɵChangeDetectionScheduler, useValue: { notify() { } } },
    { provide: ɵEffectScheduler, useValue: scheduler },
  ],
});

const injectorObj = { injector };
let toCleanup: EffectRef[] = [];

export const angularFramework: ReactiveFramework = {
  type: "inline",
  name: "@angular/signal2",
  signal: (initialValue) => {
    const s = signal(initialValue);
    return {
      get value() {
        return s();
      },
      set value(v) {
        s.set(v);
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
  effect: (_, fn) => {
    toCleanup.push(effect(fn, injectorObj));
  },
  withBatch: (fn) => {
    fn();
    scheduler.flush();
  },
  withBuild: <T>(fn: () => T) => {
    let res: T;
    effect(() => {
      res = untracked(fn);
    }, injectorObj);
    scheduler.flush();
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return res!;
  },
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup.destroy();
    }
    toCleanup = [];
  },
};
