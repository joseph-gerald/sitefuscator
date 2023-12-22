import { JSDOM } from "jsdom";
import transformer from "../transformer";
import { CSS } from "../../stylesheet";
import * as csstree from 'css-tree';

export default class extends transformer {

    classesHandled = [];

    constructor(dom: JSDOM, css: CSS, settings: object) {
        super("Style Inliner", "Inline styles to minimize CSS competence", dom, css, settings);
    }

    handle(elm: HTMLElement) {
        // iterate through element classes and inline if possible
        for (const klass of elm.classList) {
            const classStyles = this.css.classes[klass];
            // null check
            if (classStyles) elm.style.cssText += classStyles.join(";");
        }

        const elmStyle = this.css.types[elm.nodeName.toLowerCase()];
        // add element styles e.g body background-colour
        if (elmStyle) elm.style.cssText += elmStyle.join(";");

        // handle child elements
        for (const element of Object.values(elm.children)) {
            this.handle(element as HTMLElement);
        }
    }

    transform(): void {
        this.handle(this.rootElm);

        // remove inlined styles from style sheet (togglable)
        if (!this.settings.removeFromStyleSheet) return;

        const classes = Object.keys(this.css.classes);
        let styleSheet: any;

        this.css.traverse((node: csstree.CssNode) => {
            if (node.type == "StyleSheet") styleSheet = node;
            if (node.type == "Rule" && node.prelude.type == "SelectorList") {
                let selectors = node.prelude.children;

                for (const selector of selectors) {
                    switch (selector.type) {
                        case "Selector":
                            const children = selector.children;

                            // .field:focus / pseudo elements can't be inlined without js
                            if (children.size > 1) continue;

                            for (const child of children) {
                                switch (child.type) {
                                    // body { ... }
                                    // .class { ... }
                                    // #identifier { ... }
                                    case "IdSelector":
                                    case "ClassSelector":
                                    case "TypeSelector":
                                        node.block.children.clear();
                                        break;
                                }
                            }
                            break;
                        default:
                            console.warn(selector.type + " not implemented!");

                    }
                }
            }
        })
    }
}