import type { ReactiveFramework } from "../../util/reactiveFramework";

export function mux(bridge: ReactiveFramework) {
	switch (bridge.type) {
		case "inline": {
			const heads = new Array(100).fill(null).map((_) => bridge.signal(0));
			const mux = bridge.computed([], () => {
				return Object.fromEntries(heads.map((h) => h.value).entries());
			});
			const splited = heads
				.map((_, index) => bridge.computed([], () => mux.value[index]))
				.map((x) => bridge.computed([], () => x.value + 1));

			for (const x of splited) {
				bridge.effect([], () => x.value);
			}
			return () => {
				for (let i = 0; i < 10; i++) {
					bridge.withBatch(() => {
						heads[i].value = i;
					});
					console.assert(splited[i].value === i + 1);
				}
				for (let i = 0; i < 10; i++) {
					bridge.withBatch(() => {
						heads[i].value = i * 2;
					});
					console.assert(splited[i].value === i * 2 + 1);
				}
			};
		}
		case "pure": {
			const heads = new Array(100).fill(null).map((_) => bridge.signal(0));
			const mux = bridge.computed(heads, (hh) => {
				return hh;
			});
			const splited = heads
				.map((_, index) => bridge.computed([mux], (m) => m[index]))
				.map((x) => bridge.computed([x], (x) => x + 1));

			for (const x of splited) {
				bridge.effect([x], () => {});
			}
			return () => {
				for (let i = 0; i < 10; i++) {
					bridge.withBatch(() => {
						heads[i].value = i;
					});
					// console.assert(splited[i].value === i + 1); // HALP!
				}
				for (let i = 0; i < 10; i++) {
					bridge.withBatch(() => {
						heads[i].value = i * 2;
					});
					// console.assert(splited[i].value === i * 2 + 1); // HALP!
				}
			};
		}
	}
}
