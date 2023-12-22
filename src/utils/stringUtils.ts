
const base = shuffleArray('abcdefghijklmnopqrstuvwxyz'.split(''));

function shuffleArray(array: any) {
    return array.sort(() => Math.random() - 0.5);
}

function getMangledAt(index: number) {
    let mangledValue = '';

    while (index >= 0) {
        const remainder = index % 26;
        mangledValue = base[remainder] + mangledValue;
        index = Math.floor(index / 26) - 1;
    }
    return mangledValue;
}

function makeNumberStringWithLength(length: number) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += Math.round(Math.random() * 9).toString();
    }
    return result;
}

function makeNumberString() {
    return "_"+makeNumberStringWithLength(10);
}

function getMangled() {
    return getMangledAt(Math.round(10000 + Math.random() * 90000))
}

function calculateChecksum(string: string) {
    var src = string.toString();
    var checksum = 0;

    for (var i = 0; i < src.length; i++) {
        var charCode = src.charCodeAt(i);

        if (charCode != 32) {
            var result = charCode ^ 24;
            checksum += result;
        }
    }

    return checksum;
}

export default {
    getMangled,
    makeNumberString,
    calculateChecksum
}