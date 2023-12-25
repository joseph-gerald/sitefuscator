import { DOMWindow } from "jsdom";
import { JSDOM } from "jsdom";
import { CSS } from "../stylesheet";

export default abstract class {
    name: string;
    description: string;

    window: DOMWindow;
    document: Document;
    rootElm: HTMLElement;

    settings: any;
    css: CSS;

    constructor(name: string, description: string, dom: JSDOM, css: CSS, settings: object) {
        this.name = name;
        this.description = description;

        this.window = dom.window;
        this.document = this.window.document;
        this.rootElm = this.document.documentElement;

        this.settings = settings;
        this.css = css;
    }

    abstract transform(): string[] | void | Promise<void>;
}