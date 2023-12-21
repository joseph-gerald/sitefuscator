import { DOMWindow } from "jsdom";
import { JSDOM } from "jsdom";

export default abstract class {
    name: string;
    description: string;

    window: DOMWindow;
    document: Document;
    rootElm: HTMLElement;

    settings: any;

    constructor(name: string, description: string, dom: JSDOM, settings: object) {
        this.name = name;
        this.description = description;

        this.window = dom.window;
        this.document = this.window.document;
        this.rootElm = this.document.documentElement;

        this.settings = settings;
    }

    abstract transform(): void;
}