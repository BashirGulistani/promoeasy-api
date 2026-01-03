type Listener<T> = (val: T) => void;

class Signal<T> {
  private listeners: Set<Listener<T>> = new Set();

  constructor(private value: T) {}

  get(): T {
    return this.value;
  }

  set(newValue: T) {
    if (this.value !== newValue) {
      this.value = newValue;
      this.notify();
    }
  }

  subscribe(fn: Listener<T>): () => void {
    this.listeners.add(fn);
    fn(this.value); 
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.value));
  }
}

type Child = HTMLElement | string | number | null | undefined;
type StyleMap = Partial<CSSStyleDeclaration>;
type Props = {
  [key: string]: any;
  style?: StyleMap;
  dataset?: { [key: string]: string };
  onClick?: (e: MouseEvent) => void;
  className?: string;
};

