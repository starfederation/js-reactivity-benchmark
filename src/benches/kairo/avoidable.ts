import type { ReactiveFramework } from "../../util/reactiveFramework";
import { busy } from "./util";

/** avoidable change propagation  */
export function avoidablePropagation(bridge: ReactiveFramework) {
	switch (bridge.type) {
		case "inline": {
			const head = bridge.signal(0);
			const computed1 = bridge.computed([], () => head.value);
			const computed2 = bridge.computed([], () => {
				computed1.value;
				return 0;
			});
			const computed3 = bridge.computed([], () => {
				busy();
				return computed2.value + 1;
			}); // heavy computation
			const computed4 = bridge.computed([], () => computed3.value + 2);
			const computed5 = bridge.computed([], () => computed4.value + 3);
			bridge.effect([], () => {
				computed5.value;
				busy(); // heavy side effect
			});

			return () => {
				bridge.withBatch(() => {
					head.value = 1;
				});
				console.assert(computed5.value === 6);
				for (let i = 0; i < 1000; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					console.assert(computed5.value === 6);
				}
			};
		}
		case "pure": {
			const head = bridge.signal(0);
			const computed1 = bridge.computed([head], () => { });
			const computed2 = bridge.computed([computed1], () => 0);
			const computed3 = bridge.computed([computed2], (c2) => {
				busy();
				return c2 + 1;
			}); // heavy computation
			const computed4 = bridge.computed([computed3], (c3) => c3 + 2);
			const computed5 = bridge.computed([computed4], (c4) => c4 + 3);
			bridge.effect([computed5], () => {
				busy(); // heavy side effect
			});

			return () => {
				bridge.withBatch(() => {
					head.value = 1;
				});
				console.assert(computed5.value === 6);
				for (let i = 0; i < 1000; i++) {
					bridge.withBatch(() => {
						head.value = i;
					});
					console.assert(computed5.value === 6);
				}
			};
		}
	}
}
