import { obfuscate } from "./obfuscator";
import fs from "fs";

function byteCount(s: any) {
    return encodeURI(s).split(/%..|./).length - 1;
}

async function init() {
    const html = fs.readFileSync("input/htmlcssjs/index.html").toString();
    const css = fs.readFileSync("input/htmlcssjs/style.css").toString();

    const input = {
        html,
        css 
    };

    let output = await obfuscate(input);

    fs.writeFileSync("output/index.html", output[0]);
    fs.writeFileSync("output/style.css", output[1]);

    console.log("SIZE: " + byteCount(html) + " -> " + byteCount(output) + " bytes")
}

init();