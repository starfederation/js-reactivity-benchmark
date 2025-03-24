import { Counter } from "../../util/counter";
import type { ReactiveFramework } from "../../util/reactiveFramework";

/** worst case. */
export function unstable(bridge: ReactiveFramework) {
	switch (bridge.type) {
		case "inline": {
			const head = bridge.signal(0);
			const double = bridge.computed([], () => head.value * 2);
			const inverse = bridge.computed([], () => -head.value);
			const current = bridge.computed([], () => {
				let result = 0;
				for (let i = 0; i < 20; i++) {
					result += head.value % 2 ? double.value : inverse.value;
				}
				return result;
			});

			const callCounter = new Counter();
			bridge.effect([], () => {
				current.value;
				callCounter.count++;
			});
			return () => {
				bridge.withBatch(() => {
					head.value = 1;
				});
				console.assert(current.value === 40);
				// const atleast = 100;
				callCounter.count = 0;
				for (let i = 0; i < 100; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					// console.assert(current.value === i % 2 ? i * 2 * 10 : i * -10);
				}
				// console.assert(callCounter.count === atleast);
			};
		}
		case "pure": {
			const head = bridge.signal(0);
			const double = bridge.computed([head], (h) => h * 2);
			const inverse = bridge.computed([head], (h) => -h);
			const current = bridge.computed(
				[head, double, inverse],
				(h, dbl, inv) => {
					let result = 0;
					for (let i = 0; i < 20; i++) {
						result += h % 2 ? dbl : inv;
					}
					return result;
				},
			);

			const callCounter = new Counter();
			bridge.effect([current], () => {
				callCounter.count++;
			});
			return () => {
				bridge.withBatch(() => {
					head.value = 1;
				});
				console.assert(current.value === 40);
				// const atleast = 100;
				callCounter.count = 0;
				for (let i = 0; i < 100; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					// console.assert(current.value === i % 2 ? i * 2 * 10 : i * -10);
				}
				// console.assert(callCounter.count === atleast);
			};
		}
	}
}
