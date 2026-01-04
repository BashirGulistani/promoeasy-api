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





function injectGlobalStyles() {
  if (document.getElementById("tiny-dashboard-styles")) return;

  const style = document.createElement("style");
  style.id = "tiny-dashboard-styles";
  style.textContent = `
    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f3f4f6;
      --text-primary: #111827;
      --text-secondary: #6b7280;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --card-bg: #ffffff;
      --border: #e5e7eb;
      --good: #10b981;
      --bad: #ef4444;
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
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background: var(--bg-secondary);
      color: var(--text-primary);
      transition: background-color 0.25s, color 0.25s;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08);
      transition: transform 0.15s, border-color 0.25s;
    }
    .card:hover { transform: translateY(-2px); }

    .btn {
      padding: 10px 16px;
      border-radius: 10px;
      border: 1px solid transparent;
      background: var(--accent);
      color: #fff;
      font-weight: 650;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      user-select: none;
    }
    .btn:hover { background: var(--accent-hover); }
    .btn:active { transform: translateY(1px); }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      padding: 24px;
    }
    .layout {
      display: flex;
      min-height: 100vh;
    }
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: -0.02em;
    }
    .sidebar {
      width: 240px;
      background: var(--bg-primary);
      border-right: 1px solid var(--border);
      height: 100vh;
      position: sticky;
      top: 0;
      display: none;
      flex-direction: column;
      padding: 24px;
      box-sizing: border-box;
    }
    @media (min-width: 769px) {
      .sidebar { display: flex; }
    }
    .navItem {
      padding: 12px;
      border-radius: 10px;
      cursor: pointer;
      margin-bottom: 6px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .navItem.isActive {
      background: var(--bg-secondary);
      color: var(--accent);
    }
  `;
  document.head.appendChild(style);
}



const Icons = {
  Moon:
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>`,
  Sun:
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>`,
  Zap:
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>`,
};

type Theme = "light" | "dark";

const store = {
  theme: new Signal<Theme>("light"),
  count: new Signal<number>(0),
};

function applyTheme(theme: Theme) {
  document.body.setAttribute("data-theme", theme);
}














