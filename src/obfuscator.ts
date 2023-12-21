import { JSDOM } from "jsdom";
import junkAttributes from "./transformers/impl/junkAttributes";
import stringUtils from "./utils/stringUtils";

const transformers = [
    junkAttributes
]

export async function obfuscate(input: string) {
    let output = "";

    const dom = new JSDOM(input);

    for (const transformer of transformers) {
        new transformer(dom, {
            min: 4,
            max: 6,
            generator: stringUtils.makeNumberString
        }).transform();
    }

    return dom.serialize();
}