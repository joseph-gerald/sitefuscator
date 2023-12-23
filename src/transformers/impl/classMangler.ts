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
        // iterate through element classes and replace identifiers from map
        for (const klass of elm.classList) {
            if (!this.css.classes[klass]) continue;

            this.classes[klass] ??= this.settings.generator();

            const newIdentifier = this.classes[klass];

            elm.classList.replace(klass, newIdentifier);
        }

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

                            for (const child of children) {
                                switch (child.type) {
                                    // .class { ... }
                                    case "ClassSelector":
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