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
| alien-signals  | kairo.avoidablePropagation | 161.90 |
| alien-signals  | kairo.broadPropagation     | 267.80 |
| alien-signals  | kairo.deepPropagation      | 88.40  |
| alien-signals  | kairo.diamond              | 208.60 |
| alien-signals  | kairo.mux                  | 214.50 |
| alien-signals  | kairo.repeatedObservers    | 59.10  |
| alien-signals  | kairo.triangle             | 66.90  |
| alien-signals  | kairo.unstable             | 94.00  |
| datastar       | kairo.avoidablePropagation | 167.00 |
| datastar       | kairo.broadPropagation     | 317.30 |
| datastar       | kairo.deepPropagation      | 57.30  |
| datastar       | kairo.diamond              | 123.50 |
| datastar       | kairo.mux                  | 196.70 |
| datastar       | kairo.repeatedObservers    | 12.00  |
| datastar       | kairo.triangle             | 41.30  |
| datastar       | kairo.unstable             | 17.90  |
| Preact Signals | kairo.avoidablePropagation | 115.70 |
| Preact Signals | kairo.broadPropagation     | 198.70 |
| Preact Signals | kairo.deepPropagation      | 80.30  |
| Preact Signals | kairo.diamond              | 145.10 |
| Preact Signals | kairo.mux                  | 193.30 |
| Preact Signals | kairo.repeatedObservers    | 16.50  |
| Preact Signals | kairo.triangle             | 56.10  |
| Preact Signals | kairo.unstable             | 31.10  |
| @reactively    | kairo.avoidablePropagation | 240.50 |
| @reactively    | kairo.broadPropagation     | 274.80 |
| @reactively    | kairo.deepPropagation      | 119.10 |
| @reactively    | kairo.diamond              | 219.30 |
| @reactively    | kairo.mux                  | 218.70 |
| @reactively    | kairo.repeatedObservers    | 63.20  |
| @reactively    | kairo.triangle             | 70.60  |
| @reactively    | kairo.unstable             | 136.20 |
| Svelte v5      | kairo.avoidablePropagation | 786.70 |
| Svelte v5      | kairo.broadPropagation     | 423.40 |
| Svelte v5      | kairo.deepPropagation      | 172.80 |
| Svelte v5      | kairo.diamond              | 541.20 |
| Svelte v5      | kairo.mux                  | 278.80 |
| Svelte v5      | kairo.repeatedObservers    | 95.70  |
| Svelte v5      | kairo.triangle             | 130.30 |
| Svelte v5      | kairo.unstable             | 142.20 |
| alien-signals  | molBench                   | 401.00 |
| datastar       | molBench                   | 475.30 |
| Preact Signals | molBench                   | 406.50 |
| @reactively    | molBench                   | 436.60 |
| Svelte v5      | molBench                   | 413.10 |
