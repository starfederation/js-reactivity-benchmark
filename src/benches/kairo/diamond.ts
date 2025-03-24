import { Counter } from "../../util/counter";
import type { Computed, ReactiveFramework } from "../../util/reactiveFramework";

const width = 5;

export function diamond(bridge: ReactiveFramework) {
	switch (bridge.type) {
		case "inline": {
			const head = bridge.signal(0);
			const current: Computed<number>[] = [];
			for (let i = 0; i < width; i++) {
				current.push(
					bridge.computed([], () => {
						return head.value + 1;
					}),
				);
			}
			const sum = bridge.computed([], () => {
				return current.map((x) => x.value).reduce((a, b) => a + b, 0);
			});
			const callCounter = new Counter();
			bridge.effect([], () => {
				sum.value;
				callCounter.count++;
			});

			return () => {
				bridge.withBatch(() => {
					head.value = 1;
				});
				console.assert(sum.value === 2 * width);
				// const atleast = 500;
				callCounter.count = 0;
				for (let i = 0; i < 500; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					console.assert(sum.value === (i + 1) * width);
				}
				// console.assert(callCounter.count === atleast);
			};
		}
		case "pure": {
			const head = bridge.signal(0);
			const current: Computed<number>[] = [];
			for (let i = 0; i < width; i++) {
				current.push(bridge.computed([head], (h) => h + 1));
			}
			const sum = bridge.computed([...current], (...c: number[]) =>
				c.reduce((a, b) => a + b, 0),
			);
			const callCounter = new Counter();
			bridge.effect([sum], () => {
				callCounter.count++;
			});

			return () => {
				bridge.withBatch(() => {
					head.value = 1;
				});
				// console.assert(sum.value === 2 * width); // HALP!
				callCounter.count = 0;
				for (let i = 0; i < 500; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					// console.assert(sum.value === (i + 1) * width); // HALP!
				}
			};
		}
	}
}
