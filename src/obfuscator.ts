import { JSDOM } from "jsdom";
import { CSS } from "./stylesheet";
import junkAttributes from "./transformers/impl/junkAttributes";
import stringUtils from "./utils/stringUtils";
import junkElements from "./transformers/impl/junkElements";
import styleInliner from "./transformers/impl/styleInliner";
import * as csstree from 'css-tree';
import classMangler from "./transformers/impl/classMangler";
import idMangler from "./transformers/impl/idMangler";
import junkClasses from "./transformers/impl/junkClasses";
import junkIds from "./transformers/impl/junkIds";
import refrenceUpdater from "./transformers/impl/refrenceUpdater";
import bundleToLoader from "./transformers/impl/bundleToLoader";

const disabled = true;

class Transformer {

    disabled;
    transformer;
    settings;

    constructor(transformer: any, settings = {}, disabled = false) {
        this.transformer = transformer;
        this.settings = settings;
        this.disabled = disabled;
    }
}

const transformers = [

    /* Identifier Mangling */


    new Transformer(bundleToLoader),
]

export async function obfuscate(input: { html: string, css: string }) {
    const dom = new JSDOM(input.html);
    const css = new CSS(input.css)
    const data: { [key: string]: any } = [];

    for (const item of transformers) {
        // @ts-ignore
        if (item.disabled) continue;

        const settings = { ...item.settings, data };
        const transformerClass = item.transformer;

        const transformer = new transformerClass(dom, css, settings)

        console.log(`Starting ${transformer.name} / ${transformer.description}`)

        const info = transformer.transform();
        transformer.css.parse();

        if(info) data[info[0]] = info[1];
    }

    return [dom.serialize(), csstree.generate(css.ast), JSON.stringify(data)];
}