interface ElementStyle {
    [key: string]: string;
}

class UIBuilder {
    static createElement<K extends keyof HTMLElementTagNameMap>(
        tag: K, 
        styles: ElementStyle = {}, 
        text?: string, 
        classes: string[] = []
    ): HTMLElementTagNameMap[K] {
        const el = document.createElement(tag);
        
        Object.assign(el.style, styles);
        
        if (classes.length) el.classList.add(...classes);
        
        if (text) el.textContent = text;
        
        return el;
    }
}

const renderModernUI = (rootId: string) => {
    const root = document.getElementById(rootId);
    if (!root) throw new Error("Root element not found");
    document.body.style.margin = "0";
    document.body.style.fontFamily = "'Inter', sans-serif";
    document.body.style.backgroundColor = "#111";
    document.body.style.color = "#fff";

    const nav = UIBuilder.createElement('nav', {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid #333'
    });


        const logo = UIBuilder.createElement('div', {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#fff'
    }, 'SaaSify.');

    const btn = UIBuilder.createElement('button', {
        padding: '10px 20px',
        backgroundColor: '#646cff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'transform 0.2s'
    }, 'Get Started');

    btn.onmouseenter = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';

    nav.appendChild(logo);
    nav.appendChild(btn);

        const hero = UIBuilder.createElement('section', {
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    });

    const title = UIBuilder.createElement('h1', {
        fontSize: '4rem',
        margin: '0 0 20px 0',
        background: '-webkit-linear-gradient(45deg, #646cff, #ff64d6)',
        webkitBackgroundClip: 'text',
        webkitTextFillColor: 'transparent'
    }, 'Build Faster.');


    hero.appendChild(title);
    
    root.appendChild(nav);
    root.appendChild(hero);

};

renderModernUI('app');
