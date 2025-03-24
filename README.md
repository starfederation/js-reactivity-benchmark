# JS Reactivity Benchmark

```
$ pnpm bench
```

## Features

- Configurable dependency graph: graph shape, density, read rate are all adjustable.
- Easily add new benchmarks and frameworks
- Supports dynamic reactive nodes
- Framework agnostic. Simple API to test new reactive frameworks.
- Uses v8 intrinsics to warmup and cleanup
- Tracks garbage collection overhead per test
- Outputs a csv file for easy integration with other tools.

Current reactivity benchmarks ([S.js](https://github.com/adamhaile/S/blob/master/bench/bench.js), [CellX](https://github.com/Riim/cellx/blob/master/perf/perf.html)) are focused on creation time, and update time for a static graph. Additionally, existing benchmarks aren't very configurable, and don't test for dynamic dependencies. We've created a new benchmark that allows library authors to compare their frameworks against each other, and against the existing benchmarks, as well as against a new configurable benchmark with dynamically changing sources.

We're also working on enabling consistent logging and efficient tracking of GC time across all benchmarks.

The frameworks are all plenty fast for typical applications. The charts report the run time of the test in milliseconds on an M1 laptop, and are made using [Tableau](https://public.tableau.com/). Typical applications will do much more work than a framework benchmark, and at these speeds the frameworks are unlikely to bottleneck overall performance.

That said, there's learning here to improve performance of all the frameworks.

| framework      | test                       | time   |
| -------------- | -------------------------- | ------ |
| alien-signals  | kairo.avoidablePropagation | 155.80 |
| alien-signals  | kairo.broadPropagation     | 260.60 |
| alien-signals  | kairo.deepPropagation      | 82.20  |
| alien-signals  | kairo.diamond              | 202.80 |
| alien-signals  | kairo.mux                  | 219.80 |
| alien-signals  | kairo.repeatedObservers    | 58.90  |
| alien-signals  | kairo.triangle             | 67.60  |
| alien-signals  | kairo.unstable             | 96.00  |
| datastar       | kairo.avoidablePropagation | 276.60 |
| datastar       | kairo.broadPropagation     | 242.80 |
| datastar       | kairo.deepPropagation      | 96.80  |
| datastar       | kairo.diamond              | 334.40 |
| datastar       | kairo.mux                  | 340.90 |
| datastar       | kairo.repeatedObservers    | 9.20   |
| datastar       | kairo.triangle             | 84.00  |
| datastar       | kairo.unstable             | 41.80  |
| Preact Signals | kairo.avoidablePropagation | 138.80 |
| Preact Signals | kairo.broadPropagation     | 228.80 |
| Preact Signals | kairo.deepPropagation      | 95.40  |
| Preact Signals | kairo.diamond              | 210.80 |
| Preact Signals | kairo.mux                  | 225.60 |
| Preact Signals | kairo.repeatedObservers    | 52.20  |
| Preact Signals | kairo.triangle             | 68.60  |
| Preact Signals | kairo.unstable             | 71.90  |
| @reactively    | kairo.avoidablePropagation | 239.50 |
| @reactively    | kairo.broadPropagation     | 272.90 |
| @reactively    | kairo.deepPropagation      | 110.70 |
| @reactively    | kairo.diamond              | 225.90 |
| @reactively    | kairo.mux                  | 227.00 |
| @reactively    | kairo.repeatedObservers    | 65.80  |
| @reactively    | kairo.triangle             | 70.10  |
| @reactively    | kairo.unstable             | 140.40 |
| Svelte v5      | kairo.avoidablePropagation | 778.80 |
| Svelte v5      | kairo.broadPropagation     | 523.50 |
| Svelte v5      | kairo.deepPropagation      | 184.70 |
| Svelte v5      | kairo.diamond              | 530.20 |
| Svelte v5      | kairo.mux                  | 276.00 |
| Svelte v5      | kairo.repeatedObservers    | 95.50  |
| Svelte v5      | kairo.triangle             | 132.90 |
| Svelte v5      | kairo.unstable             | 150.50 |
| alien-signals  | molBench                   | 400.60 |
| datastar       | molBench                   | 16.50  |
| Preact Signals | molBench                   | 395.30 |
| @reactively    | molBench                   | 396.00 |
| Svelte v5      | molBench                   | 416.20 |
