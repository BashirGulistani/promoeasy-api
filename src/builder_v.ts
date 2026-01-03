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


const Icons = {
  Moon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  Sun: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
  Zap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
};


const themeState = new Signal<'light' | 'dark'>('light');
const countState = new Signal<number>(0);

const Header = () => {
  const toggleBtn = h('button', {
    className: 'btn',
    style: { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    onClick: () => {
      const next = themeState.get() === 'light' ? 'dark' : 'light';
      themeState.set(next);
      document.body.setAttribute('data-theme', next);
    }
  });

  themeState.subscribe((theme) => {
    toggleBtn.innerHTML = theme === 'light' ? Icons.Moon : Icons.Sun;
  });

  return h('header', {
    style: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 24px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)'
    }
  },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '20px' } },
      h('span', { innerHTML: Icons.Zap, style: { color: 'var(--accent)' } }),
      "Dashboard"
    ),
    toggleBtn
  );
};

const StatCard = (title: string, valueSignal?: Signal<number>) => {
  const valueDisplay = h('div', { 
    style: { fontSize: '32px', fontWeight: 'bold', margin: '10px 0' } 
  }, '0');

  if (valueSignal) {
    valueSignal.subscribe(val => valueDisplay.textContent = val.toString());
  }

  return h('div', { className: 'card' },
    h('div', { style: { color: 'var(--text-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' } }, title),
    valueDisplay,
    h('div', { style: { fontSize: '12px', color: '#10b981' } }, "+12.5% from last month")
  );
};

const InteractiveSection = () => {
  const btnInc = h('button', { className: 'btn', onClick: () => countState.set(countState.get() + 1) }, 'Increment');
  const btnDec = h('button', { className: 'btn', style: { background: '#ef4444', marginLeft: '10px' }, onClick: () => countState.set(countState.get() - 1) }, 'Decrement');

  return h('div', { className: 'card', style: { gridColumn: 'span 2' } },
    h('h3', {}, 'Interactive Control'),
    h('p', { style: { color: 'var(--text-secondary)', marginBottom: '20px' } }, 
      'This section demonstrates reactive state binding without React. Click below to update the global state.'
    ),
    btnInc, btnDec
  );
};


const Sidebar = () => {
  const items = ['Overview', 'Analytics', 'Settings', 'Users'];
  
  return h('aside', {
    style: {
      width: '240px', background: 'var(--bg-primary)', borderRight: '1px solid var(--border)',
      height: '100vh', position: 'sticky', top: '0', display: 'flex', flexDirection: 'column', padding: '24px'
    }
  },
    ...items.map((item, index) => h('div', {
      style: {
        padding: '12px', borderRadius: '8px', cursor: 'pointer',
        background: index === 0 ? 'var(--bg-secondary)' : 'transparent',
        color: index === 0 ? 'var(--accent)' : 'var(--text-secondary)',
        marginBottom: '4px', fontWeight: '500'
      }
    }, item))
  );
};

const renderApp = (rootId: string) => {
  injectGlobalStyles();
  const root = document.getElementById(rootId);
  if (!root) throw new Error("Root element not found");

  const layout = h('div', { style: { display: 'flex', minHeight: '100vh' } },
    h('div', { style: { display: window.innerWidth > 768 ? 'block' : 'none' }}, Sidebar()),
    
    h('main', { style: { flex: '1', display: 'flex', flexDirection: 'column' } },
      Header(),
      h('div', { className: 'grid' },
        StatCard('Total Revenue'),
        StatCard('Active Users', countState), 
        StatCard('Bounce Rate'),
        InteractiveSection()
      )
    )
  );

  root.appendChild(layout);
};

renderApp('app');
