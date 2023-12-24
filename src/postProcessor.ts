
const classPattern = /\.[a-zA-Z0-9\-_]+/g;
const stringPattern = /"[^"]*"|'[^']*'|\`[^`]*\``/g;

function match(code: string, rule: RegExp, slice = false) {
    const matches = code.match(rule);
    return matches ? matches.map(str => slice ? str.slice(1, -1) : str) : [];
}

// For our use case we will just be using regex due to its simplicity
export function updateJavascript(code: string, mapName: string, map: { [key: string]: string }) {
    let newCode = code;
    const strings = match(code, stringPattern, true);

    switch (mapName) {
        case "idMap.json":
            for (const id of strings) {
                const newId = map[id];

                if (!newId) continue;

                // Escape special characters in newId
                const escapedNewId = newId.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');

                // Replace the string in the code
                newCode = newCode.replace(new RegExp(`"${id}"|'${id}'|\\\`${id}\\\``, 'g'), `"${escapedNewId}"`);
            }
            break;
        case "classMap.json":
            for (const string of strings) {

                const classes = match(string, classPattern);

                for (const klass of classes) {
                    const key = klass.split(".").join(""); // remove . as we have classnames (no .) in map
                    const newName = map[key];

                    if (!newName) continue;

                    // Escape special characters in newId
                    const escapedNewClass = newName.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');

                    // Replace the string in the code
                    newCode = newCode.replace(new RegExp(`"${klass}"|'${klass}'|\\\`${klass}\\\``, 'g'), `"${"." + escapedNewClass}"`);
                }
            }
            break;
    }

    return newCode;
}