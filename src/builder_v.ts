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


const h = (
  tag: string,
  props: Props = {},
  ...children: (Child | Child[])[]
): HTMLElement => {
  const el = document.createElement(tag);

  Object.entries(props).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.assign(el.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.toLowerCase().substring(2);
      el.addEventListener(eventName, value);
    } else if (key === 'className') {
      el.className = value;
    } else {
      (el as any)[key] = value;
    }
  });

  const appendChildren = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (Array.isArray(node)) {
        appendChildren(node);
      } else if (node instanceof HTMLElement) {
        el.appendChild(node);
      } else if (node !== null && node !== undefined) {
        el.appendChild(document.createTextNode(String(node)));
      }
    });
  };
  appendChildren(children);

  return el;
};

const injectGlobalStyles = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f3f4f6;
      --text-primary: #111827;
      --text-secondary: #6b7280;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --card-bg: #ffffff;
      --border: #e5e7eb;
    }
    [data-theme="dark"] {
      --bg-primary: #111827;
      --bg-secondary: #1f2937;
      --text-primary: #f9fafb;
      --text-secondary: #9ca3af;
      --accent: #818cf8;
      --accent-hover: #6366f1;
      --card-bg: #1f2937;
      --border: #374151;
    }
    body {
      margin: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      transition: background-color 0.3s, color 0.3s;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, border-color 0.3s;
    }
    .card:hover { transform: translateY(-2px); }
    .btn {
      padding: 10px 16px;
      border-radius: 8px;
      border: none;
      background: var(--accent);
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn:hover { background: var(--accent-hover); }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      padding: 24px;
    }
  `;
  document.head.appendChild(style);
};


