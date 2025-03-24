// Inspired by https://github.com/solidjs/solid/blob/main/packages/solid/bench/bench.cjs
import { logPerfResult } from "../main";
import { possiblelyGC } from "../util/perfTests";
import type {
  Computed,
  ReactiveFramework,
  Signal,
} from "../util/reactiveFramework";

const COUNT = 1e5;

// type Reader = () => number;
export function sbench(framework: ReactiveFramework) {
  bench(createDataSignals, COUNT, COUNT);
  bench(createComputations0to1, COUNT, 0);
  bench(createComputations1to1, COUNT, COUNT);
  bench(createComputations2to1, COUNT / 2, COUNT);
  bench(createComputations4to1, COUNT / 4, COUNT);
  bench(createComputations1000to1, COUNT / 1000, COUNT);
  // createTotal += bench(createComputations8to1, COUNT, 8 * COUNT);
  bench(createComputations1to2, COUNT, COUNT / 2);
  bench(createComputations1to4, COUNT, COUNT / 4);
  bench(createComputations1to8, COUNT, COUNT / 8);
  bench(createComputations1to1000, COUNT, COUNT / 1000);
  bench(updateComputations1to1, COUNT * 4, 1);
  bench(updateComputations2to1, COUNT * 2, 2);
  bench(updateComputations4to1, COUNT, 4);
  bench(updateComputations1000to1, COUNT / 100, 1000);
  bench(updateComputations1to2, COUNT * 4, 1);
  bench(updateComputations1to4, COUNT * 4, 1);
  bench(updateComputations1to1000, COUNT * 4, 1);

  function bench(
    fn: (n: number, sources: Computed<number>[]) => void,
    count: number,
    scount: number,
  ) {
    const time = run(fn, count, scount);
    logPerfResult({
      framework: framework.name,
      test: fn.name,
      time,
    });
  }

  function run(
    fn: (n: number, sources: Computed<number>[]) => void,
    n: number,
    scount: number,
  ) {
    // prep n * arity sources
    let start = 0;
    let end = 0;

    framework.withBuild(() => {
      // run 3 times to warm up
      let sources = createDataSignals(scount, []);

      fn(n / 100, sources);
      sources = createDataSignals(scount, []);
      fn(n / 100, sources);
      sources = createDataSignals(scount, []);
      fn(n / 100, sources);
      sources = createDataSignals(scount, []);
      for (let i = 0; i < scount; i++) {
        sources[i].value;
        sources[i].value;
        sources[i].value;
      }

      // start GC clean
      possiblelyGC();

      start = performance.now();

      fn(n, sources);

      // end GC clean
      sources = [];
      possiblelyGC();
      end = performance.now();
    });

    return end - start;
  }

  function createDataSignals(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n; i++) {
      sources[i] = framework.signal(i);
    }
    return sources;
  }

  function createComputations0to1(n: number, _sources: Computed<number>[]) {
    for (let i = 0; i < n; i++) {
      createComputation0(i);
    }
  }

  function createComputations1to1000(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n / 1000; i++) {
      for (let j = 0; j < 1000; j++) {
        createComputation1(sources[i]);
      }
    }
  }

  function createComputations1to8(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n / 8; i++) {
      createComputation1(sources[i]);
      createComputation1(sources[i]);
      createComputation1(sources[i]);
      createComputation1(sources[i]);
      createComputation1(sources[i]);
      createComputation1(sources[i]);
      createComputation1(sources[i]);
      createComputation1(sources[i]);
    }
  }

  function createComputations1to4(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n / 4; i++) {
      createComputation1(sources[i]);
      createComputation1(sources[i]);
      createComputation1(sources[i]);
      createComputation1(sources[i]);
    }
  }

  function createComputations1to2(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n / 2; i++) {
      createComputation1(sources[i]);
      createComputation1(sources[i]);
    }
  }

  function createComputations1to1(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n; i++) {
      createComputation1(sources[i]);
    }
  }

  function createComputations2to1(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n; i++) {
      createComputation2(sources[i * 2], sources[i * 2 + 1]);
    }
  }

  function createComputations4to1(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n; i++) {
      createComputation4(
        sources[i * 4],
        sources[i * 4 + 1],
        sources[i * 4 + 2],
        sources[i * 4 + 3],
      );
    }
  }

  // function createComputations8to1(n: number, sources: Computed<number>[]) {
  //   for (let i = 0; i < n; i++) {
  //     createComputation8(
  //       sources[i * 8].read,
  //       sources[i * 8 + 1].read,
  //       sources[i * 8 + 2].read,
  //       sources[i * 8 + 3].read,
  //       sources[i * 8 + 4].read,
  //       sources[i * 8 + 5].read,
  //       sources[i * 8 + 6].read,
  //       sources[i * 8 + 7].read
  //     );
  //   }
  // }

  // only create n / 100 computations, as otherwise takes too long
  function createComputations1000to1(n: number, sources: Computed<number>[]) {
    for (let i = 0; i < n; i++) {
      createComputation1000(sources, i * 1000);
    }
  }

  function createComputation0(i: number) {
    framework.computed([], () => i);
  }

  function createComputation1(s1: Computed<number>) {
    switch (framework.type) {
      case "inline":
        framework.computed([], () => s1.value);
        break;
      case "pure":
        framework.computed([s1], (x) => x);
    }
  }

  function createComputation2(s1: Computed<number>, s2: Computed<number>) {
    switch (framework.type) {
      case "inline":
        framework.computed([], () => s1.value + s2.value);
        break;
      case "pure":
        framework.computed([s1, s2], (s1, s2) => s1 + s2);
    }
  }

  function createComputation4(
    s1: Computed<number>,
    s2: Computed<number>,
    s3: Computed<number>,
    s4: Computed<number>,
  ) {
    switch (framework.type) {
      case "inline":
        framework.computed([], () => s1.value + s2.value + s3.value + s4.value);
        break;
      case "pure":
        framework.computed(
          [s1, s2, s3, s4],
          (s1, s2, s3, s4) => s1 + s2 + s3 + s4,
        );
    }
  }

  // function createComputation8(
  //   s1: Reader,
  //   s2: Reader,
  //   s3: Reader,
  //   s4: Reader,
  //   s5: Reader,
  //   s6: Reader,
  //   s7: Reader,
  //   s8: Reader
  // ) {
  //   framework.computed(
  //     () => s1() + s2() + s3() + s4() + s5() + s6() + s7() + s8()
  //   );
  // }

  function createComputation1000(ss: Computed<number>[], offset: number) {
    switch (framework.type) {
      case "inline":
        framework.computed([], () => {
          let sum = 0;
          for (let i = 0; i < 1000; i++) {
            sum += ss[offset + i].value;
          }
          return sum;
        });
        break;
      case "pure":
        framework.computed(ss.slice(offset, offset + 1000), (...ss) =>
          ss.reduce((a, b) => a + b, 0),
        );
        break;
    }
  }

  function updateComputations1to1(n: number, sources: Signal<number>[]) {
    const s1 = sources[0];
    switch (framework.type) {
      case "inline":
        framework.computed([], () => s1.value);
        break;
      case "pure":
        framework.computed([s1], (g1) => g1);
    }
    for (let i = 0; i < n; i++) {
      s1.value = i;
    }
  }

  function updateComputations2to1(n: number, sources: Signal<number>[]) {
    const [s1, s2] = sources;
    switch (framework.type) {
      case "inline":
        framework.computed([], () => s1.value + s2.value);
        break;
      case "pure":
        framework.computed([s1, s2], (g1, g2) => g1 + g2);
    }
    for (let i = 0; i < n; i++) {
      s1.value = i;
    }
  }

  function updateComputations4to1(n: number, sources: Signal<number>[]) {
    const [s1, s2, s3, s4] = sources;
    switch (framework.type) {
      case "inline":
        framework.computed([], () => s1.value + s2.value + s3.value + s4.value);
        break;
      case "pure":
        framework.computed(
          [s1, s2, s3, s4],
          (g1, g2, g3, g4) => g1 + g2 + g3 + g4,
        );
    }
    for (let i = 0; i < n; i++) {
      s1.value = i;
    }
  }

  function updateComputations1000to1(n: number, sources: Signal<number>[]) {
    const s1 = sources[0];
    switch (framework.type) {
      case "inline":
        framework.computed([], () => {
          let sum = 0;
          for (let i = 0; i < 1000; i++) {
            sum += sources[i].value;
          }
          return sum;
        });
        break;
      case "pure":
        framework.computed(sources, (...ss) => ss.reduce((a, b) => a + b, 0));
    }
    for (let i = 0; i < n; i++) {
      s1.value = i;
    }
  }

  function updateComputations1to2(n: number, sources: Signal<number>[]) {
    const s1 = sources[0];
    switch (framework.type) {
      case "inline":
        framework.computed([], () => s1.value);
        framework.computed([], () => s1.value);
        break;
      case "pure":
        framework.computed([s1], (g1) => g1);
        framework.computed([s1], (g1) => g1);
    }
    for (let i = 0; i < n / 2; i++) {
      s1.value = i;
    }
  }

  function updateComputations1to4(n: number, sources: Signal<number>[]) {
    const s1 = sources[0];
    switch (framework.type) {
      case "inline":
        framework.computed([], () => s1.value);
        framework.computed([], () => s1.value);
        framework.computed([], () => s1.value);
        framework.computed([], () => s1.value);
        break;
      case "pure":
        framework.computed([s1], (g1) => g1);
        framework.computed([s1], (g1) => g1);
        framework.computed([s1], (g1) => g1);
        framework.computed([s1], (g1) => g1);
    }
    for (let i = 0; i < n / 4; i++) {
      s1.value = i;
    }
  }

  function updateComputations1to1000(n: number, sources: Signal<number>[]) {
    const s1 = sources[0];
    for (let i = 0; i < 1000; i++) {
      switch (framework.type) {
        case "inline":
          framework.computed([], () => s1.value);
          break;
        case "pure":
          framework.computed([s1], (g1) => g1);
      }
    }
    for (let i = 0; i < n / 1000; i++) {
      s1.value = i;
    }
  }
}
