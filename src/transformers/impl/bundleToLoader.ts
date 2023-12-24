import { JSDOM } from "jsdom";
import transformer from "../transformer";
import { CSS } from "../../stylesheet";
import * as csstree from 'css-tree';

export default class extends transformer {
    identifiers: { [key: string]: any; } = {};

    constructor(dom: JSDOM, css: CSS, settings: object) {
        super("Bundler", "Bundle and export your HTML into a fast and secure JavaScript unpacker.", dom, css, settings);
    }

    handle(elm: HTMLElement, path = "") {
        // handle child elements
        for (const element of Object.values(elm.children)) {
            this.handle(element as HTMLElement, path + elm);
        }
    }

    transform(): void {
        this.handle(this.rootElm, "root/");
    }
}