import { JSDOM } from "jsdom";
import transformer from "../transformer";
import { CSS } from "../../stylesheet";
import { minify } from "terser";
import stringUtils from "../../utils/stringUtils";

export default class extends transformer {
    identifiers: { [key: string]: any; } = {};
    data: any = {};
    scriptElements: HTMLElement[] = [];
    
    secrets: any = {
        br: stringUtils.getMangled()
    }

    constructor(dom: JSDOM, css: CSS, settings: object) {
        super("Bundler", "Bundle and export your HTML into a fast and secure JavaScript unpacker.", dom, css, settings);
    }

    handle(elm: HTMLElement, path = "") {
        let children = Object.values(elm.children).map(element => this.handle(element as HTMLElement));
        let attributes: any = {};

        let innerHTML = elm.innerHTML;

        for (const child of elm.children) {
            if(child.tagName != "BR") innerHTML = innerHTML.replace(child.outerHTML, "");
            else {
                innerHTML = innerHTML.replace(child.outerHTML, this.secrets.br);
            }
        }

        for (const attr of elm.attributes) attributes[attr.name] = attr.value;

        const data: { [key: string]: any } = {
            tag: elm.tagName,
            props: {
                textContent: innerHTML
            },
            attributes,
        }

        if (children.length > 0) data.children = children;

        return data;
    }

    scriptIterator(element: HTMLElement) {
        if (element.tagName == "SCRIPT") {
            this.scriptElements.push(element);
        }

        for (const child of element.children) {
            this.scriptIterator(child as HTMLElement);
        }

    }

    handleScripts(rootElm: HTMLElement) {
        this.scriptIterator(rootElm);

        // Reverse hoist? script elements to bottom
        for (const script of this.scriptElements) {
            script.remove();
            this.rootElm.appendChild(script);
        }
    }

    transform(): Promise<any> {

        this.handleScripts(this.rootElm);

        this.data = this.handle(this.rootElm, "root/");

        const loadingCoverHTML = `
        <div id="sitefuscator-loading-cover"
            style="position: fixed; user-select: none; z-index: 50; left: 0; top: 0; display: flex; backdrop-filter: blur(500px); align-items: center; justify-content: center; height: 100vh; width: 100vw; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h1 id="sitefuscator-loading-title" style="color: white; text-shadow: -2px 0 red, 0 2px blue, 2px 0 green, 0 -2px yellow;">
                Building Page
            </h1>
        </div>
        `

        const script = `
        const rootElm = document.documentElement;

            const data = ${JSON.stringify(this.data)};

            const scripts = [];

            function handle(data, parent) {
                const tagName = data.tag;
                const elm = document.createElement(tagName);

                if (tagName == "SCRIPT") {
                    scripts.push(data.props.textContent)
                }

                for (const [prop, value] of Object.entries(data.props)) {
                    elm[prop] = value;
                }

                if (data.attributes) {
                    for (const [attribute, value] of Object.entries(data.attributes)) {
                        elm.setAttribute(attribute, value);
                    }
                }

                if (data.children) {
                    for (const child of data.children) {
                        elm.appendChild(handle(child));
                    }
                }

                elm.innerHTML = elm.innerHTML.replace("${this.secrets.br}","<br>");

                return elm;
            }

            for (const child of rootElm.children) child.remove();

            const newRoot = handle(data);
            newRoot.innerHTML = \`
            ${loadingCoverHTML}
            \` + newRoot.innerHTML;
            rootElm.replaceWith(newRoot);

            
            window.addEventListener('load', () => {
                const loadingCover = document.getElementById("sitefuscator-loading-cover");
                const loadingTitle = document.getElementById("sitefuscator-loading-title");

                loadingCover.style.opacity = 1;
                loadingTitle.style.scale = 1;

                const id = setInterval(() => {
                    if (loadingCover) {
                        loadingCover.style.opacity = loadingCover.style.opacity * 0.8 - 0.01;
                        loadingTitle.style.scale = loadingTitle.style.scale - -0.01;

                        if (loadingCover.style.opacity < 0) {
                            loadingCover.remove();
                            clearInterval(id);

                            for (const script of scripts) {
                                eval(script);
                            }
                        
                            window.dispatchEvent(new Event("load"));
                        }
                    }
                }, 100/10)
            }, { once: true })`

            return minify(script).then(output => {
                this.document.documentElement.innerHTML = `
        <html>
            <head>
                <title>Loading...</title>
                ${loadingCoverHTML}
                <script>
                    ${this.settings.minify ? output.code : script}
                </script>
            </head>
        </html>
                `
            })

    }
}