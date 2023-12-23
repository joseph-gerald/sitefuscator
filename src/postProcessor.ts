function findStrings(code: string) {
    const regex = /"[^"]*"|'[^']*'|\`[^`]*\``/g;
    const matches = code.match(regex);
    return matches ? matches.map(str => str.slice(1, -1)) : [];
}

// For our use case we will just be using regex due to its simplicity
export function updateJavascript(code: string, idMap: { [key: string]: string }) {
    let newCode = code;
    const strings = findStrings(code);

    for (const id of strings) {
        const newId = idMap[id];

        if (!newId) continue;

        // Escape special characters in newId
        const escapedNewId = newId.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');

        // Replace the string in the code
        newCode = newCode.replace(new RegExp(`"${id}"|'${id}'|\\\`${id}\\\``, 'g'), `"${escapedNewId}"`);
    }

    return newCode;
}