import $ from "mol_wire_lib";
import { ReactiveFramework, Signal } from "../util/reactiveFramework";

const Atom = $.$mol_wire_atom; // fix a bug in mol exports

let toCleanup: $.$mol_wire_atom<unknown, [], unknown>[] = [];
export const molWireFramework: ReactiveFramework = {
  type: "inline",
  name: "$mol_wire_atom",
  signal: <T>(initialValue: T): Signal<T> => {
    const atom = new Atom("", (next: T = initialValue) => next);
    return {
      set value(v: T) {
        atom.put(v);
      },
      get value() {
        return atom.sync();
      },
    };
  },
  computed: (_, fn) => {
    const atom = new Atom("", fn);
    return {
      get value() {
        return atom.sync();
      },
    };
  },
  effect: (_, fn) =>
    toCleanup.push(new Atom("", fn) as $.$mol_wire_atom<unknown, [], unknown>),
  withBatch: (fn) => {
    fn();
    Atom.sync();
  },
  withBuild: (fn) => fn(),
  cleanup: () => {
    for (const cleanup of toCleanup) {
      cleanup.destructor();
    }
    toCleanup = [];
  },
};
