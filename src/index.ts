import { obfuscate } from "./obfuscator";
import { updateJavascript } from "./postProcessor";
import fs from "fs";
import { minify } from "html-minifier-terser";
import CleanCSS from "clean-css";

function byteCount(s: any) {
    return encodeURI(s).split(/%..|./).length - 1;
}

async function init() {
    const html = fs.readFileSync("input/portfolio/index.html").toString();
    const css = fs.readFileSync("input/portfolio/style.css").toString();


    /*
    const html = fs.readFileSync("input/htmlcssjs/index.html").toString();
    const css = fs.readFileSync("input/htmlcssjs/style.css").toString();
    */
    const js = fs.readFileSync("input/htmlcssjs/script.js").toString();

    const input = {
        html,
        css
    };

    console.log("\nStarting Obfuscator\n")

    let output = await obfuscate(input);

    console.log("\nSIZE: " + byteCount(html) + " -> " + byteCount(output) + " bytes\n")

    try {
        const minifiedHTML = await minify(output[0], {
            collapseWhitespace: true,
            minifyJS: true,
            minifyCSS: true,
            collapseInlineTagWhitespace: true
        });
        const minifiedCSS = new CleanCSS().minify(output[1]).styles;
        
        fs.writeFileSync("output/index.html", minifiedHTML);
        fs.writeFileSync("output/style.css", minifiedCSS);
        console.log("Minified HTML and CSS sucesfully!");
    } catch (e) {
        console.error(e);
        console.log("Failed to minify HTML and CSS defaulting to unminified...");

        fs.writeFileSync("output/index.html", output[0]);
        fs.writeFileSync("output/style.css", output[1]);
    }


    const data = JSON.parse(output[2]);

    for (const info of data) {
        fs.writeFileSync(`output/data/${info[0]}`, info[1]);

        // update js loaded
        if ("idMap.json classMap.json".split(" ").includes(info[0])) {
            fs.writeFileSync("output/script.js", updateJavascript(js, info[0], JSON.parse(info[1])));
        }
    }
}

init();