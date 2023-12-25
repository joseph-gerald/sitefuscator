import { JSDOM } from "jsdom";
import transformer from "../transformer";
import { CSS } from "../../stylesheet";
import * as csstree from 'css-tree';

export default class extends transformer {
    identifiers: { [key: string]: any; } = {};
    data: any = {};

    constructor(dom: JSDOM, css: CSS, settings: object) {
        super("Bundler", "Bundle and export your HTML into a fast and secure JavaScript unpacker.", dom, css, settings);
    }

    handle(elm: HTMLElement, path = "") {
        let children = Object.values(elm.children).map(element => this.handle(element as HTMLElement));
        let attributes: any = {};

        let innerHTML = elm.innerHTML;

        for (const child of elm.children) {
            innerHTML = innerHTML.replace(child.outerHTML, "");
        }

        for (const attr of elm.attributes) attributes[attr.name] = attr.value;

        const data: { [key: string]: any } = {
            tag: elm.tagName,
            props: {
                textContent: innerHTML
            },
            attributes,
            children: children
        }

        return data;
    }

    transform(): void {
        this.data = this.handle(this.rootElm, "root/");

        const loadingCoverHTML = `
        <div id="sitefuscator-loading-cover"
            style="position: fixed; user-select: none; z-index: 50; left: 0; top: 0; display: flex; backdrop-filter: blur(500px); align-items: center; justify-content: center; height: 100vh; width: 100vw; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h1 id="sitefuscator-loading-title" style="color: white; text-shadow: -2px 0 red, 0 2px blue, 2px 0 green, 0 -2px yellow;">
                Building Page
            </h1>
        </div>
        `

        this.document.documentElement.innerHTML = `
<html>
    <head>
        <title>Loading...</title>
        ${loadingCoverHTML}
        <script>
            const rootElm = document.documentElement;

            const data = ${JSON.stringify(this.data)};

            function handle(data, parent) {
                const tagName = data.tag;
                const elm = document.createElement(tagName);

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

                return elm;
            }

            for (const child of rootElm.children) child.remove();

            const newRoot = handle(data);
            newRoot.innerHTML = \`
            ${loadingCoverHTML}
            \` + newRoot.innerHTML;
            rootElm.replaceWith(newRoot);

            
            setTimeout(() => {
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
                        }
                    }
                }, 100/10)
            }, 600)
        </script>
    </head>
</html>
        `
    }
}