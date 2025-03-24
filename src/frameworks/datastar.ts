import { ReactiveFramework } from "../util/reactiveFramework";

let toCleanup: (() => void)[] = [];

export const datastarFramework: ReactiveFramework = {
    type: "pure",
    name: "datastar",
    signal,
    computed,
    effect: (args, fn) => toCleanup.push(effect(args, fn)),
    withBatch: (fn) => {
        // startBatch();
        fn();
        // endBatch();
    },
    withBuild: (fn) => fn(),
    cleanup: () => {
        for (const cleanup of toCleanup) {
            cleanup();
        }
        toCleanup = [];
    },
};


interface Subscriber {
    md(): void
}

export abstract class Dependency {
    p = '' // path
    vr = 1 // version
    abstract readonly value: unknown
    ss = new Set<Subscriber>() // subscribers
}

// DJB2 hash function
function depHash(...deps: Dependency[]) {
    let h = 5381
    for (const dep of deps) {
        h = (h * 33) ^ dep.vr
    }
    return h
}

export class Signal<T> extends Dependency implements Subscriber {
    constructor(private v: T) {
        super()
    }

    set value(v: T) {
        if (this.v === v) {
            return
        }
        this.v = v
        this.vr++
        this.md()
    }

    md() {
        for (const sub of this.ss) {
            sub.md()
        }
    }

    get value() {
        return this.v
    }
}

export function signal<T>(initialValue: T) {
    return new Signal(initialValue)
}

export type DerivedFn<O> = (...args: unknown[]) => O

export class Derived<O> extends Dependency implements Subscriber {
    d = true // dirty
    v!: O
    vr = 0

    constructor(
        private dd: Dependency[],
        private fn: DerivedFn<O>,
    ) {
        super()
        for (const dep of dd) {
            dep.ss.add(this)
        }
    }

    get value() {
        if (!this.d) {
            return this.v
        }
        this.d = false
        const vh = depHash(...this.dd)
        if (vh === this.vr) {
            return this.v
        }

        this.vr = vh
        const args = this.dd.map((dep) => dep.value)
        const v = this.fn(...args)
        if (this.v === v) {
            return this.v
        }
        this.v = v
        this.vr++
        return this.v
    }

    md() {
        this.d = true
        for (const sub of this.ss) {
            sub.md()
        }
    }
}

export function computed<O>(dd: Dependency[], fn: (...args: unknown[]) => O) {
    return new Derived(dd, fn)
}

class Effect implements Subscriber {
    v = -1 // version

    constructor(
        private deps: Dependency[],
        private fn: (...args: unknown[]) => void,
    ) {
        for (const dep of deps) {
            dep.ss.add(this)
        }
    }

    md() {
        const vh = depHash(...this.deps)
        if (vh === this.v) {
            return
        }
        this.v = vh
        const args = this.deps.map((dep) => dep.value)
        this.fn(...args)
    }
}

export type OnRemovalFn = () => void
export type EffectFn = (
    deps: Dependency[],
    fn: (...pureValuesFromDependencies: unknown[]) => void,
) => OnRemovalFn

export function effect(
    deps: Dependency[],
    fn: (...args: unknown[]) => void,
): OnRemovalFn {
    const e = new Effect(deps, fn)
    e.md()
    return () => {
        for (const dep of deps) {
            dep.ss.delete(e)
        }
    }
}
