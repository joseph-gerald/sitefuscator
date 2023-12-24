import { obfuscate } from "./obfuscator";
import { updateJavascript } from "./postProcessor";
import fs from "fs";

function byteCount(s: any) {
    return encodeURI(s).split(/%..|./).length - 1;
}

async function init() {
    const html = fs.readFileSync("input/portfolio/index.html").toString();
    const css = fs.readFileSync("input/portfolio/style.css").toString();
    const js = fs.readFileSync("input/htmlcssjs/script.js").toString();

    const input = {
        html,
        css
    };

    let output = await obfuscate(input);



    fs.writeFileSync("output/index.html", output[0]);
    fs.writeFileSync("output/style.css", output[1]);

    const data = JSON.parse(output[2]);

    for (const info of data) {
        fs.writeFileSync(`output/data/${info[0]}`, info[1]);

        // update js loaded
        if ("idMap.json classMap.json".split(" ").includes(info[0])) {
            fs.writeFileSync("output/script.js", updateJavascript(js, info[0], JSON.parse(info[1])));
        }
    }

    console.log("SIZE: " + byteCount(html) + " -> " + byteCount(output) + " bytes")
}

init();