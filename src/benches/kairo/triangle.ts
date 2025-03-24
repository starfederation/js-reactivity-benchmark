import { Counter } from "../../util/counter";
import type { Computed, ReactiveFramework } from "../../util/reactiveFramework";

const width = 10;

export function triangle(bridge: ReactiveFramework) {
	switch (bridge.type) {
		case "inline": {
			const head = bridge.signal(0);
			let current = head as Computed<number>;
			const list: Computed<number>[] = [];
			for (let i = 0; i < width; i++) {
				const c = current;
				list.push(current);
				current = bridge.computed([], () => {
					return c.value + 1;
				});
			}
			const sum = bridge.computed([], () => {
				return list.map((x) => x.value).reduce((a, b) => a + b, 0);
			});

			const callCounter = new Counter();
			bridge.effect([], () => {
				sum.value;
				callCounter.count++;
			});

			return () => {
				const constant = count(width);
				bridge.withBatch(() => {
					head.value = 1;
				});
				console.assert(sum.value === constant);
				// const atleast = 100;
				callCounter.count = 0;
				for (let i = 0; i < 100; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					console.assert(sum.value === constant - width + i * width);
				}
				// console.assert(callCounter.count === atleast);
			};
		}
		case "pure": {
			const head = bridge.signal(0);
			let current = head as Computed<number>;
			const list: Computed<number>[] = [];
			for (let i = 0; i < width; i++) {
				const c = current;
				list.push(current);
				current = bridge.computed([c], (c) => c + 1);
			}
			const sum = bridge.computed(list, (...ll: number[]) =>
				ll.reduce((a, b) => a + b, 0),
			);

			const callCounter = new Counter();
			bridge.effect([sum], () => {
				callCounter.count++;
			});

			return () => {
				const constant = count(width);
				bridge.withBatch(() => {
					head.value = 1;
				});
				console.assert(sum.value === constant);
				// const atleast = 100;
				callCounter.count = 0;
				for (let i = 0; i < 100; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					console.assert(sum.value === constant - width + i * width);
				}
				// console.assert(callCounter.count === atleast);
			};
		}
	}
}

function count(number: number) {
	return new Array(number)
		.fill(0)
		.map((_, i) => i + 1)
		.reduce((x, y) => x + y, 0);
}
