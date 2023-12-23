import { JSDOM } from "jsdom";
import transformer from "../transformer";
import { CSS } from "../../stylesheet";
import * as csstree from 'css-tree';

export default class extends transformer {
    identifiers: { [key: string]: any; } = {};

    constructor(dom: JSDOM, css: CSS, settings: object) {
        super("Identifier Mangler", "Mangle ids to remove information.", dom, css, settings);
    }

    handle(elm: HTMLElement) {
        if (elm.id) {
            this.identifiers[elm.id] ??= this.settings.generator();
    
            const newIdentifier = this.identifiers[elm.id];
    
            elm.id = newIdentifier;
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
                                    // body { ... }
                                    // .class { ... }
                                    // #identifier { ... }
                                    case "IdSelector":
                                        if (this.identifiers[child.name]) child.name = this.identifiers[child.name];
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

        return ["idMap.json", JSON.stringify(this.identifiers)]
    }
}