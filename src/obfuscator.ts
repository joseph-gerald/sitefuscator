import { JSDOM } from "jsdom";
import { CSS } from "./stylesheet";
import junkAttributes from "./transformers/impl/junkAttributes";
import stringUtils from "./utils/stringUtils";
import junkElements from "./transformers/impl/junkElements";
import styleInliner from "./transformers/impl/styleInliner";
import * as csstree from 'css-tree';

const disabled = true;

const transformers = [
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
            max: 1,
            
            // WARNING: gets big fast use with care
            children: {
                min: 1,
                max: 2,
                depth: 5
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

    for (const item of transformers) {
        if (item.disabled) continue;

        const settings = item.settings;
        const transformerClass = item.transformer;

        const transformer = new transformerClass(dom, css, settings)

        transformer.transform();
    }

    return [dom.serialize(), csstree.generate(css.ast)];
}