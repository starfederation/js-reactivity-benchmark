import { Counter } from "../../util/counter";
import type { Computed, ReactiveFramework } from "../../util/reactiveFramework";

/** broad propagation */
export function broadPropagation(bridge: ReactiveFramework) {
	switch (bridge.type) {
		case "inline": {
			const head = bridge.signal(0);
			let last = head as Computed<number>;
			const callCounter = new Counter();
			for (let i = 0; i < 50; i++) {
				const current = bridge.computed([], () => {
					return head.value + i;
				});
				const current2 = bridge.computed([], () => {
					return current.value + 1;
				});
				bridge.effect([], () => {
					current2.value;
					callCounter.count++;
				});
				last = current2;
			}

			return () => {
				bridge.withBatch(() => {
					head.value = 1;
				});
				// const atleast = 50 * 50;
				callCounter.count = 0;
				for (let i = 0; i < 50; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					console.assert(last.value === i + 50);
				}
				// console.assert(callCounter.count === atleast, callCounter.count);
			};
		}
		case "pure": {
			const head = bridge.signal(0);
			let last = head as Computed<number>;
			const callCounter = new Counter();
			for (let i = 0; i < 50; i++) {
				const current = bridge.computed([head], (h) => h + i);
				const current2 = bridge.computed([current], (c) => c + 1);
				bridge.effect([current2], () => {
					callCounter.count++;
				});
				last = current2;
			}

			return () => {
				bridge.withBatch(() => {
					head.value = 1;
				});
				// const atleast = 50 * 50;
				callCounter.count = 0;
				for (let i = 0; i < 50; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					console.assert(last.value === i + 50);
				}
				// console.assert(callCounter.count === atleast, callCounter.count);
			};
		}
	}
}
