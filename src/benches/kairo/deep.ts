import { Counter } from "../../util/counter";
import type { Computed, ReactiveFramework } from "../../util/reactiveFramework";
const len = 50;

/** deep propagation */
export function deepPropagation(bridge: ReactiveFramework) {
	switch (bridge.type) {
		case "inline": {
			const head = bridge.signal(0);
			let current = head as Computed<number>;
			for (let i = 0; i < len; i++) {
				const c = current;
				current = bridge.computed([], () => {
					return c.value + 1;
				});
			}
			const callCounter = new Counter();

			bridge.effect([], () => {
				current.value;
				callCounter.count++;
			});

			const iter = 50;

			return () => {
				bridge.withBatch(() => {
					head.value = 1;
				});
				// const atleast = iter;
				callCounter.count = 0;
				for (let i = 0; i < iter; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					console.assert(current.value === len + i);
				}

				// console.assert(callCounter.count === atleast);
			};
		}
		case "pure": {
			const head = bridge.signal(0);
			let current = head as Computed<number>;
			for (let i = 0; i < len; i++) {
				const c = current;
				current = bridge.computed([c], (c) => c + 1);
			}
			const callCounter = new Counter();

			bridge.effect([current], () => {
				callCounter.count++;
			});

			const iter = 50;

			return () => {
				bridge.withBatch(() => {
					head.value = 1;
				});
				// const atleast = iter;
				callCounter.count = 0;
				for (let i = 0; i < iter; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					console.assert(current.value === len + i);
				}

				// console.assert(callCounter.count === atleast);
			};
		}
	}
}
