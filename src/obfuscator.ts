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

    new Transformer(classMangler, {
        generator: stringUtils.getMangled // new identifiers
    }),

    new Transformer(idMangler, {
        generator: stringUtils.getMangled // new identifiers
    }),

    /* Data Inlining */

    new Transformer(styleInliner, {
        removeFromStyleSheet: true
    }),

    /* Junk Data */


    new Transformer(junkIds, {
        generator: stringUtils.getMangled, // new identifiers
    }),

    new Transformer(junkClasses, {
        generator: stringUtils.getMangled, // new identifiers
        min: 2,
        max: 4,
    }),

    new Transformer(junkElements, {
        min: 2,
        max: 2,
        
        // WARNING: gets big fast use carefully
        children: {
            min: 0,
            max: 0,
            depth: 0
        },

        mode: "junk", // junk = garbage elements, spam = spammed real elements but no effect on document
        generator: stringUtils.getMangled // needed for junk element
    }),

    new Transformer(junkAttributes, {
        min: 5,
        max: 5,

        generator: stringUtils.makeNumberString
    }),

    new Transformer(refrenceUpdater, {
        generator: stringUtils.makeNumberString
    }),

    // Finalising


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