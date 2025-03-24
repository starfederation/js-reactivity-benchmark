import { nextTick } from "../util/asyncUtil";
import { fastestTest } from "../util/benchRepeat";
import type { PerfResultCallback } from "../util/perfLogging";
import type { ReactiveFramework } from "../util/reactiveFramework";

function fib(n: number): number {
  if (n < 2) return 1;
  return fib(n - 1) + fib(n - 2);
}

function hard(n: number, _log: string) {
  return n + fib(16);
}

const numbers = Array.from({ length: 5 }, (_, i) => i);

export async function molBench(
  framework: ReactiveFramework,
  logPerfResult: PerfResultCallback,
) {
  const res = [];
  const iter = framework.withBuild(() => {
    switch (framework.type) {
      case "inline": {
        const A = framework.signal(0);
        const B = framework.signal(0);
        const C = framework.computed([], () => (A.value % 2) + (B.value % 2));
        const D = framework.computed([], () =>
          numbers.map((i) => ({ x: i + (A.value % 2) - (B.value % 2) })),
        );
        const E = framework.computed([], () =>
          hard(C.value + A.value + D.value[0].x, "E"),
        );
        const F = framework.computed([], () =>
          hard(D.value[2].x || B.value, "F"),
        );
        const G = framework.computed(
          [],
          () => C.value + (C.value || E.value % 2) + D.value[4].x + F.value,
        );

        framework.effect([], () => res.push(hard(G.value, "H")));
        framework.effect([], () => res.push(G.value));
        framework.effect([], () => res.push(hard(F.value, "J")));

        return (i: number) => {
          res.length = 0;
          framework.withBatch(() => {
            B.value = 1;
            A.value = 1 + i * 2;
          });
          framework.withBatch(() => {
            A.value = 2 + i * 2;
            B.value = 2;
          });
        };
      }
      case "pure": {
        const A = framework.signal(0);
        const B = framework.signal(0);
        const C = framework.computed([A, B], (a, b) => (a % 2) + (b % 2));
        const D = framework.computed([A, B], (a, b) =>
          numbers.map((i) => ({ x: i + (a % 2) - (b % 2) })),
        );
        const E = framework.computed([C, A, D], (c, a, d) =>
          hard(c + a + d[0].x, "E"),
        );
        const F = framework.computed([D, B], (d, b) => hard(d[2].x || b, "F"));
        const G = framework.computed(
          [C, E, D, F],
          (c, e, d, f) => c + (c || e % 2) + d[4].x + f,
        );

        framework.effect([G], (g: number) => res.push(hard(g, "H")));
        framework.effect([G], (g: number) => res.push(g));
        framework.effect([F], (f: number) => res.push(hard(f, "J")));

        return (i: number) => {
          res.length = 0;
          framework.withBatch(() => {
            B.value = 1;
            A.value = 1 + i * 2;
          });
          framework.withBatch(() => {
            A.value = 2 + i * 2;
            B.value = 2;
          });
        };
      }
    }
  });

  iter(0);
  iter(1);

  await nextTick();
  iter(2);

  const { timing } = await fastestTest(5, () => {
    for (let i = 0; i < 1e4; i++) {
      iter(i);
    }
  });

  framework.cleanup();
  if (globalThis.gc) {
    gc?.();
    gc?.();
  }

  logPerfResult({
    framework: framework.name,
    test: "molBench",
    time: timing.time,
  });
}
