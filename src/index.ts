import { obfuscate } from "./obfuscator";
import fs from "fs";

function byteCount(s: any) {
    return encodeURI(s).split(/%..|./).length - 1;
}

async function init() {
    const input = fs.readFileSync("input/html/index.html").toString();

    let output = await obfuscate(input);

    fs.writeFileSync("output/output.html", output);

    console.log("SIZE: " + byteCount(input) + " -> " + byteCount(output) + " bytes")
}

init();