import { JSDOM } from "jsdom";
import { CSS } from "./stylesheet";
import junkAttributes from "./transformers/impl/junkAttributes";
import stringUtils from "./utils/stringUtils";
import junkElements from "./transformers/impl/junkElements";
import styleInliner from "./transformers/impl/styleInliner";
import * as csstree from 'css-tree';
import classMangler from "./transformers/impl/classMangler";

const disabled = true;

const transformers = [
    {
        transformer: classMangler,
        settings: {
            generator: stringUtils.getMangled // new identifiers
        }
    },
    {
        transformer: styleInliner,
        settings: {
            removeFromStyleSheet: true
        }
    },
    {
        disabled,
        transformer: junkElements,
        settings: {
            min: 1,
            max: 10,
            
            // WARNING: gets big fast use with care
            children: {
                min: 1,
                max: 2,
                depth: 4
            },

            mode: "junk", // junk = garbage elements, spam = spammed real elements but no effect on document
            generator: stringUtils.getMangled // needed for junk element
        }
    },
    {
        disabled,
        transformer: junkAttributes,
        settings: {
            min: 5,
            max: 5,

            generator: stringUtils.makeNumberString
        }
    },
]

export async function obfuscate(input: { html: string, css: string }) {
    const dom = new JSDOM(input.html);
    const css = new CSS(input.css)
    const data: string[][] = [];

    for (const item of transformers) {
        // @ts-ignore
        if (item.disabled) continue;

        const settings = item.settings;
        const transformerClass = item.transformer;

        const transformer = new transformerClass(dom, css, settings)

        console.log(`Starting ${transformer.name} / ${transformer.description}`)

        const info = transformer.transform();
        transformer.css.parse();

        if(info) data.push(info);
    }

    return [dom.serialize(), csstree.generate(css.ast), JSON.stringify(data)];
}