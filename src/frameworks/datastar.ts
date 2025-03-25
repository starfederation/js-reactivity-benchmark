import type { ReactiveFramework } from "../util/reactiveFramework";


const toCleanup: (() => void)[] = [];

export const datastarFramework: ReactiveFramework = {
    type: "pure",
    name: "datastar",
    signal,
    computed,
    effect: (dd, fn) => {
        toCleanup.push(effect(dd, fn));
    },
    withBatch: (fn) => batch(fn),
    withBuild: (fn) => fn(),
    cleanup: () => {
        for (const cleanup of toCleanup) {
            cleanup();
        }
        toCleanup.length = 0;
    },
};

type Subscriber = {
    md(): void;
};

abstract class Dependency {
    p = ""; // path
    vr = 1; // version
    abstract readonly value: unknown;
    ss: Subscriber[] = []; // subscribers
}

let batching = false;
const currentBatch = new Set<() => void>();
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const args: any[][] = [];

export class Signal<T> extends Dependency {
    private v: T; // value
    private c?: (() => void)[] = undefined; // callbacks

    constructor(value: T) {
        super();
        this.v = value;
    }

    get value() {
        return this.v;
    }

    set value(value: T) {
        if (this.v === value) {
            return;
        }
        this.v = value;
        this.vr++;

        if (!this.c) {
            this.c = [];
            const queue = [...this.ss];
            const visited = new Set<Subscriber>(queue);

            let i = 0;
            while (i < queue.length) {
                const sub = queue[i++];
                this.c.push(() => sub.md());

                if (!(sub instanceof Derived)) {
                    continue;
                }

                for (const s of sub.ss) {
                    if (visited.has(s)) {
                        continue;
                    }

                    visited.add(s);
                    queue.push(s);
                }
            }
        }

        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        for (const md of this.c!) {
            md();
        }
    }
}

export function signal<T>(value: T) {
    return new Signal(value);
}

export class Derived<O> extends Dependency implements Subscriber {
    private v!: O; // value
    private d = true; // dirty
    private vs: number = 0; // version sum

    constructor(
        public dd: Dependency[],
        private fn: (...args: unknown[]) => O,
    ) {
        super();
        args[dd.length] = Array(dd.length);
        for (const d of dd) {
            d.ss.push(this);
        }
    }

    get value() {
        if (!this.d) {
            return this.v;
        }
        this.d = false;

        let vs = 0;
        for (let i = 0; i < this.dd.length; i++) {
            args[this.dd.length][i] = this.dd[i].value;
            vs += this.dd[i].vr;
        }

        if (this.vs === vs) {
            return this.v;
        }
        this.vs = vs;

        const newValue = this.fn(...args[this.dd.length]);
        if (this.v === newValue) {
            return this.v;
        }
        this.v = newValue;
        this.vr++;

        return this.v;
    }

    md() {
        this.d = true;
    }
}

export function computed<O>(
    dd: Dependency[],
    compute: (...args: unknown[]) => O,
) {
    return new Derived(dd, compute);
}

class Effect implements Subscriber {
    private vs = 0; // version sum

    constructor(
        private dd: Dependency[],
        private fn: (...args: unknown[]) => void,
    ) {
        args[dd.length] = Array(dd.length);
        for (const d of dd) {
            d.ss.push(this);
        }

        this.md();
    }

    md() {
        if (batching) {
            currentBatch.add(() => this.md());
            return;
        }

        let vs = 0;
        for (let i = 0; i < this.dd.length; i++) {
            args[this.dd.length][i] = this.dd[i].value;
            vs += this.dd[i].vr;
        }

        if (this.vs === vs) {
            return;
        }

        this.vs = vs;
        this.fn(...args[this.dd.length]);
    }
}

export function effect(dd: Dependency[], fn: (...args: unknown[]) => void) {
    const e = new Effect(dd, fn);
    return () => {
        for (const d of dd) {
            d.ss = d.ss.filter((s) => s !== e);
        }
    };
}

export function batch(fn: () => void) {
    if (batching) {
        fn();
        return;
    }

    currentBatch.clear();
    batching = true;
    fn();
    batching = false;

    for (const fn of currentBatch) {
        fn();
    }
}