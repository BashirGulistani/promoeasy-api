type Unsub = () => void;
type Listener<T> = (val: T) => void;

class Signal<T> {
  private listeners = new Set<Listener<T>>();
  constructor(private value: T) {}

  get(): T {
    return this.value;
  }

  set(next: T) {
    if (!Object.is(this.value, next)) {
      this.value = next;
      this.listeners.forEach((fn) => fn(this.value));
    }
  }

  subscribe(fn: Listener<T>, opts: { immediate?: boolean } = {}): Unsub {
    this.listeners.add(fn);
    if (opts.immediate !== false) fn(this.value);
    return () => this.listeners.delete(fn);
  }
}

function effect(run: () => void | Unsub): Unsub {
  const cleanup = run();
  return typeof cleanup === "function" ? cleanup : () => {};
}




