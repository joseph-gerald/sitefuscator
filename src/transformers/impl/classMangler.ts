import { JSDOM } from "jsdom";
import transformer from "../transformer";
import { CSS } from "../../stylesheet";
import * as csstree from 'css-tree';

export default class extends transformer {
    classes: { [key: string]: any; } = {};

    constructor(dom: JSDOM, css: CSS, settings: object) {
        super("Class Mangler", "Mangle class names to remove information.", dom, css, settings);
    }

    handle(elm: HTMLElement) {
        // iterate through element classes and inline if possible
        for (const klass of elm.classList) {
            this.classes[klass] ??= this.settings.generator();

            const newIdentifier = this.classes[klass];

            elm.classList.replace(klass, newIdentifier);
        }

        const elmStyle = this.css.types[elm.nodeName.toLowerCase()];
        // add element styles e.g body background-colour
        if (elmStyle) elm.style.cssText += elmStyle.join(";");

        // handle child elements
        for (const element of Object.values(elm.children)) {
            this.handle(element as HTMLElement);
        }


    }

    transform(): string[] {
        this.handle(this.rootElm);


        this.css.traverse((node: csstree.CssNode) => {
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
                                        if (this.classes[child.name]) child.name = this.classes[child.name];
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

        return ["classMap.json", JSON.stringify(this.classes)]
    }
}