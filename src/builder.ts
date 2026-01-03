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

