
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

export default {
    getMangled,
    makeNumberString
}