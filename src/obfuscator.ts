import { JSDOM } from "jsdom";
import junkAttributes from "./transformers/impl/junkAttributes";
import stringUtils from "./utils/stringUtils";
import junkElements from "./transformers/impl/junkElements";

const transformers = [
    {
        transformer: junkElements,
        settings: {
            min: 4,
            max: 6,
            
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
        transformer: junkAttributes,
        settings: {
            min: 4,
            max: 6,

            generator: stringUtils.makeNumberString
        }
    },
]

export async function obfuscate(input: string) {
    const dom = new JSDOM(input);

    for (const item of transformers) {
        const transformer = item.transformer;
        const settings = item.settings;

        new transformer(dom, settings).transform();
    }

    return dom.serialize();
}