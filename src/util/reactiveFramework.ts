/** interface for a reactive framework.
 *
 * Implement this interface to add a new reactive framework to the test and performance test suite.
 */
export interface ReactiveFramework {
  type: "inline" | "pure";
  name: string;
  signal<T>(initialValue: T): Signal<T>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  computed<T>(args: any[], fn: (...args: any[]) => T): Computed<T>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  effect(args: any[], fn: (...args: any[]) => void): void;
  withBatch<T>(fn: () => T): void;
  withBuild<T>(fn: () => T): T;
  cleanup(): void;
}

export interface Signal<T> {
  value: T;
}

export interface Computed<T> {
  readonly value: T;
}
