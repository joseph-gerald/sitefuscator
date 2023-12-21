import { JSDOM } from "jsdom";
import transformer from "../transformer";


export default class extends transformer {
    constructor(dom: JSDOM, settings: object) {
        super("Junk Attributes", "Insert junk attributes into the html, heavily bloating the html.", dom, settings);
    }

    getRandomElementName() {
        return "";
    }

    generateJunkElement(noChildren = true, depth = 0) {
        const elm = this.document.createElement(this.settings.mode == "junk" ? this.settings.generator() : this.getRandomElementName);
        
        let size = Math.round(this.settings.children.min + (Math.random() * (this.settings.children.max - this.settings.children.min)));
        
        if (noChildren && (!depth || depth > this.settings.children.depth)) {
            return elm;
        }

        for (size > 0; size--;) {
            elm.appendChild(this.generateJunkElement(true, 1 + depth));
        }
        
        return elm;
    }

    handle(elm: HTMLElement) {
        // get how many junk elements to insert
        const size = Math.round(this.settings.min + (Math.random() * (this.settings.max - this.settings.min)));
        const parent = elm.parentElement;

        // root elm does not have a parent
        if (parent) {
            let insertBefore = Math.round(Math.random() * size);
            let insertAfter = size - insertBefore;

            // insert elements before current element
            for (insertBefore > 0; insertBefore--;) {
                parent.insertBefore(this.generateJunkElement(false), elm);
            }

            // insert original element inside junk
            const junk = this.generateJunkElement(false);
            junk.appendChild(elm)

            parent.appendChild(junk);

            // insert elements after current element
            for (insertAfter > 0; insertAfter--;) {
                parent.appendChild(this.generateJunkElement(false));
            }
        }

        // handle child elements
        for (const element of Object.values(elm.children)) {
            this.handle(element as HTMLElement);
        }
    }

    transform(): void {
        this.handle(this.rootElm);
    }
}