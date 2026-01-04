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



type Child = Node | string | number | boolean | null | undefined;
type StyleMap = Partial<CSSStyleDeclaration>;

type Props = {
  class?: string;
  className?: string;
  style?: StyleMap;
  dataset?: Record<string, string>;
  innerHTML?: string;
  [key: string]: any;
};


function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...children: (Child | Child[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    if ((key === "class" || key === "className") && typeof value === "string") {
      el.className = value;
      continue;
    }

    if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value);
      continue;
    }

    if (key === "dataset" && typeof value === "object") {
      Object.assign(el.dataset, value);
      continue;
    }

    if (key === "innerHTML" && typeof value === "string") {
      el.innerHTML = value;
      continue;
    }

    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
      continue;
    }
    if (key in el) {
      (el as any)[key] = value;
    } else {
      el.setAttribute(key, String(value));
    }
  }
  const append = (node: Child) => {
    if (node === null || node === undefined || node === false) return;

    if (Array.isArray(node)) {
      node.forEach(append as any);
      return;
    }

    if (node instanceof Node) {
      el.appendChild(node);
      return;
    }

    el.appendChild(document.createTextNode(String(node)));
  };

  children.flat().forEach(append);

  return el;
}















