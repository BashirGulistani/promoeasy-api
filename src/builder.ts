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


};

renderModernUI('app');
