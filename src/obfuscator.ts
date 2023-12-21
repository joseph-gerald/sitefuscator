import { JSDOM } from "jsdom";


export async function obfuscate(input: string) {
    let output = "";

    const dom = new JSDOM(input);
    const window = dom.window;
    const document = window.document;
    const html = document.documentElement.children;
    const elements = Object.values(html);


    

    return output;
}