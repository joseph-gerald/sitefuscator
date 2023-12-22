import { JSDOM } from "jsdom";
import transformer from "../transformer";
import { CSS } from "../../stylesheet";

export default class extends transformer {
    constructor(dom: JSDOM, css: CSS, settings: object) {
        super("Junk Attributes", "Insert junk attributes into the html, heavily bloating the html.", dom, css, settings);
    }

    handle(elm: HTMLElement) {
        // get how many junk attributes to insert
        const size = Math.round(this.settings.min + (Math.random() * (this.settings.max - this.settings.min)));

        const oldAttributes: Attr[] = [];
        let index = 0;

        // remove and collect old attributes
        for (const attr of elm.attributes) {
            oldAttributes.push(attr);
            elm.removeAttribute(attr.name);
        }

        // insert junk elements and reinsert old elements aswell
        for (let i = 0; i < size; i++) {
            elm.setAttribute(this.settings.generator(), this.settings.generator())

            if (Math.random() > 1 / size) {
                const attr = oldAttributes[index++];

                if (!attr) continue;

                elm.setAttribute(attr.name, attr.value);
            }
        }

        // incase some old attributes were left over
        for (const attr of oldAttributes) {
            elm.setAttribute(attr.name, attr.value);
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