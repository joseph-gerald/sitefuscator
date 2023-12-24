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

const disabled = true;

const transformers = [

    /* Identifier Mangling */

    {
        transformer: classMangler,
        settings: {
            generator: stringUtils.getMangled // new identifiers
        }
    },
    {
        transformer: idMangler,
        settings: {
            generator: stringUtils.getMangled // new identifiers
        }
    },

    /* Data Inlining */

    {
        transformer: styleInliner,
        settings: {
            removeFromStyleSheet: true
        }
    },

    /* Junk Data */

    {
        transformer: junkIds,
        settings: {
            generator: stringUtils.getMangled, // new identifiers
        }
    },

    {
        transformer: junkClasses,
        settings: {
            generator: stringUtils.getMangled, // new identifiers
            min: 2,
            max: 4,
        }
    },

    {
        transformer: junkElements,
        settings: {
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
        }
    },

    {
        transformer: junkAttributes,
        settings: {
            min: 5,
            max: 5,

            generator: stringUtils.makeNumberString
        }
    },

    {
        transformer: refrenceUpdater,
        settings: {
            generator: stringUtils.makeNumberString
        }
    },
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

        console.log(`Initializing transformer`)

        const transformer = new transformerClass(dom, css, settings)

        console.log(`Starting ${transformer.name} / ${transformer.description}`)

        const info = transformer.transform();
        transformer.css.parse();

        if(info) data[info[0]] = info[1];
    }

    return [dom.serialize(), csstree.generate(css.ast), JSON.stringify(data)];
}