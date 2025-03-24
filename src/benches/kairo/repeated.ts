import { Counter } from "../../util/counter";
import type { ReactiveFramework } from "../../util/reactiveFramework";

const size = 30;

/** repeated observers */
export function repeatedObservers(bridge: ReactiveFramework) {
	switch (bridge.type) {
		case "inline": {
			const head = bridge.signal(0);
			const current = bridge.computed([], () => {
				let result = 0;
				for (let i = 0; i < size; i++) {
					// tbh I think it's meanigless to be this big...
					result += head.value;
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
				console.assert(current.value === size);
				// const atleast = 100;
				callCounter.count = 0;
				for (let i = 0; i < 100; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					console.assert(current.value === i * size);
				}
				// console.assert(callCounter.count === atleast);
			};
		}
		case "pure": {
			const head = bridge.signal(0);
			const current = bridge.computed([head], (h) => {
				let result = 0;
				for (let i = 0; i < size; i++) {
					// tbh I think it's meanigless to be this big...
					result += h;
				}
				return result;
			});

			const callCounter = new Counter();
			bridge.effect([current], () => {
				callCounter.count++;
			});

			return () => {
				bridge.withBatch(() => {
					head.value = 1;
				});
				console.assert(current.value === size);
				// const atleast = 100;
				callCounter.count = 0;
				for (let i = 0; i < 100; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					console.assert(current.value === i * size);
				}
				// console.assert(callCounter.count === atleast);
			};
		}
	}
}
