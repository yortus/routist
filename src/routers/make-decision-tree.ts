'use strict';
import getKeysDeep from '../utils/get-keys-deep';
import Hierarchy from '../utils/hierarchy';
import Pattern from '../patterns/pattern';





// TODO: ...
export type GetBestMatchingPattern = (address: string) => Pattern;





// TODO: ...
export default function makeDecisionTree(patternHierarchy: Hierarchy<Pattern>): GetBestMatchingPattern {

    // TODO: ...
    let normalizedPatterns = getKeysDeep(patternHierarchy);

    // TODO: doc...
    function getBody(thisPattern: Pattern, childPatterns: Hierarchy<Pattern>, nestDepth: number): string {
        let indent = ' '.repeat(nestDepth * 4);
        let childLines = Array.from(childPatterns.keys()).map((npat, i) => {
            let childNode = childPatterns.get(npat);
            let isLeaf = childNode.size === 0;
            let id = getIdForPattern(npat);
            let result = `${indent}${i > 0 ? 'else ' : ''}if (${id}.match(address)) `;
            result += isLeaf ? `return ${id};\n` : `{\n${getBody(npat, childNode, nestDepth + 1)}${indent}}\n`;
            return result;
        });
        let lastLine = `${indent}${childLines.length > 0 ? 'else ' : ''}return ${getIdForPattern(thisPattern)};\n`;
        return childLines.join('') + lastLine;
    }

    // TODO: doc...
    let lines = [
        ...normalizedPatterns.map((npat, i) => `let ${getIdForPattern(npat)} = normalizedPatterns[${i}];\n`),
        '',
        'return function getBestMatchingPattern(address) {',
        getBody(Pattern.UNIVERSAL, patternHierarchy.get(Pattern.UNIVERSAL), 1),
        '};'
    ];
//console.log(lines);
// debugger;

    // TODO: temp testing... capture unmangled Pattern id... remove/fix this!!!
    let fn = (function(Pattern) {
        let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
        return fn;
    })(Pattern);
//console.log(fn.toString());
//debugger;
    return fn;
}


// TODO: ...
function getIdForPattern(pattern: Pattern) {
    return '__' + pattern.toString()
        .split('')
        .map(c => {
            if (/[a-zA-Z0-9_]/.test(c)) return c;
            if (c === '/') return 'ﾉ'; // (U+FF89)
            if (c === '.') return 'ˌ'; // (U+02CC)
            if (c === '-') return 'ー'; // (U+30FC)
            if (c === ' ') return 'ㆍ'; // (U+318D)
            if (c === '…') return '﹍'; // (U+FE4D)
            if (c === '*') return 'ᕽ'; // (U+157D)
            throw new Error(`Unrecognized character '${c}' in pattern '${pattern}'`);
        })
        .join('') + '__';
}
