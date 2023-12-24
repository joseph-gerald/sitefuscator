import { JSDOM } from "jsdom";
import transformer from "../transformer";
import { CSS } from "../../stylesheet";
import { updateJavascript } from "../../postProcessor";

export default class extends transformer {
    constructor(dom: JSDOM, css: CSS, settings: object) {
        super("Refrence Updater", "Update class and id refrences in HTML <script> tags.", dom, css, settings);
    }

    generateRandomName(): string {
        const random = this.settings.generator();

        // we don't wanna generate an identifier that is used
        if (this.css.identifiers[random]) return this.generateRandomName();

        return random;
    }

    handle(elm: HTMLElement) {
        if (elm.tagName == "SCRIPT") {
            for (const [mapName, map] of Object.entries(this.settings.data)) {
                elm.innerHTML = updateJavascript(elm.innerHTML, mapName, JSON.parse(map as string))
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