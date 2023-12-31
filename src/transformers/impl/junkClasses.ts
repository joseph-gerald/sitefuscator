import { JSDOM } from "jsdom";
import transformer from "../transformer";
import { CSS } from "../../stylesheet";
import * as csstree from 'css-tree';

export default class extends transformer {
    constructor(dom: JSDOM, css: CSS, settings: object) {
        super("Junk Classes", "Add junk classes to decrease HTML legibility.", dom, css, settings);
    }

    generateRandomName(): string {
        const random = this.settings.generator();

        // we don't wanna generate a classname that is used
        if (this.css.classes[random]) return this.generateRandomName();

        return random;
    }

    handle(elm: HTMLElement) {
        const size = Math.round(this.settings.min + (Math.random() * (this.settings.max - this.settings.min))) - elm.classList.length;
        
        for (let i = 0; i < size; i++) {
            elm.classList.add(this.generateRandomName());
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