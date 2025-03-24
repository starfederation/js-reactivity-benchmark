// The following is an implementation of the cellx benchmark https://github.com/Riim/cellx/blob/master/perf/perf.html
import { nextTick } from "../util/asyncUtil";
import type { PerfResultCallback } from "../util/perfLogging";
import type { Computed, ReactiveFramework } from "../util/reactiveFramework";

const cellx = (framework: ReactiveFramework, layers: number) => {
	return framework.withBuild(() => {
		const start = {
			prop1: framework.signal(1),
			prop2: framework.signal(2),
			prop3: framework.signal(3),
			prop4: framework.signal(4),
		};

		let layer: {
			prop1: Computed<number>;
			prop2: Computed<number>;
			prop3: Computed<number>;
			prop4: Computed<number>;
		} = start;

		switch (framework.type) {
			case "inline": {
				for (let i = layers; i > 0; i--) {
					const m = layer;
					const s = {
						prop1: framework.computed([], () => m.prop2.value),
						prop2: framework.computed([], () => m.prop1.value - m.prop3.value),
						prop3: framework.computed([], () => m.prop2.value + m.prop4.value),
						prop4: framework.computed([], () => m.prop3.value),
					};

					framework.effect([], () => s.prop1.value);
					framework.effect([], () => s.prop2.value);
					framework.effect([], () => s.prop3.value);
					framework.effect([], () => s.prop4.value);

					s.prop1.value;
					s.prop2.value;
					s.prop3.value;
					s.prop4.value;

					layer = s;
				}

				const end = layer;

				const startTime = performance.now();

				const before = [
					end.prop1.value,
					end.prop2.value,
					end.prop3.value,
					end.prop4.value,
				] as const;

				framework.withBatch(() => {
					start.prop1.value = 4;
					start.prop2.value = 3;
					start.prop3.value = 2;
					start.prop4.value = 1;
				});

				const after = [
					end.prop1.value,
					end.prop2.value,
					end.prop3.value,
					end.prop4.value,
				] as const;

				const endTime = performance.now();
				const elapsedTime = endTime - startTime;

				return [elapsedTime, before, after] as const;
			}
			case "pure": {
				for (let i = layers; i > 0; i--) {
					const m = layer;
					const s = {
						prop1: framework.computed([m.prop2], (p2) => p2),
						prop2: framework.computed([m.prop1, m.prop3], (p1, p3) => p1 - p3),
						prop3: framework.computed([m.prop2, m.prop4], (p2, p4) => p2 + p4),
						prop4: framework.computed([m.prop3], (p3) => p3),
					};

					framework.effect([s.prop1], (p1) => p1);
					framework.effect([s.prop2], (p2) => p2);
					framework.effect([s.prop3], (p3) => p3);
					framework.effect([s.prop4], (p4) => p4);

					s.prop1.value;
					s.prop2.value;
					s.prop3.value;
					s.prop4.value;

					layer = s;
				}

				const end = layer;

				const startTime = performance.now();

				const before = [
					end.prop1.value,
					end.prop2.value,
					end.prop3.value,
					end.prop4.value,
				] as const;

				framework.withBatch(() => {
					start.prop1.value = 4;
					start.prop2.value = 3;
					start.prop3.value = 2;
					start.prop4.value = 1;
				});

				const after = [
					end.prop1.value,
					end.prop2.value,
					end.prop3.value,
					end.prop4.value,
				] as const;

				const endTime = performance.now();
				const elapsedTime = endTime - startTime;

				return [elapsedTime, before, after] as const;
			}
		}
	});
};

const arraysEqual = (a: readonly number[], b: readonly number[]) => {
	if (a.length !== b.length) return false;

	for (let i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}

	return true;
};

type BenchmarkResults = [
	readonly [number, number, number, number],
	readonly [number, number, number, number],
];

export const cellxbench = async (
	framework: ReactiveFramework,
	logPerfResult: PerfResultCallback,
) => {
	const expected: Record<number, BenchmarkResults> = {
		1000: [
			[-3, -6, -2, 2],
			[-2, -4, 2, 3],
		],
		// 2500: [
		//   [-3, -6, -2, 2],
		//   [-2, -4, 2, 3],
		// ],
		// 5000: [
		//   [2, 4, -1, -6],
		//   [-2, 1, -4, -4],
		// ],
	};

	const results: Record<number, BenchmarkResults> = {};

	for (const layers in expected) {
		let total = 0;
		for (let i = 0; i < 10; i++) {
			await nextTick();

			const [elapsed, before, after] = cellx(framework, Number(layers));

			results[layers] = [before, after];

			total += elapsed;
		}

		logPerfResult({
			framework: framework.name,
			test: `cellx${layers}`,
			time: total,
		});
	}

	for (const layers in expected) {
		const [before, after] = results[layers];
		const [expectedBefore, expectedAfter] = expected[layers];

		console.assert(
			arraysEqual(before, expectedBefore),
			`Expected first layer ${expectedBefore}, found first layer ${before}`,
		);

		console.assert(
			arraysEqual(after, expectedAfter),
			`Expected last layer ${expectedAfter}, found last layer ${after}`,
		);
	}
};
