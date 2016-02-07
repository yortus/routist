'use strict';
import getAllGraphNodes from '../utils/get-all-graph-nodes';
import Graph from '../utils/graph';
import Pattern from '../patterns/pattern';





// TODO: ...
export type GetBestMatchingPattern = (address: string) => Pattern;





// TODO: ...
export default function makeDecisionTree(patternHierarchy: Graph<Pattern>): GetBestMatchingPattern {

    // TODO: ...
    let normalizedPatterns = getAllGraphNodes(patternHierarchy);

    // TODO: doc...
    function getBody(specializations: Graph<Pattern>, fallback: Pattern, nestDepth: number): string {
        let indent = ' '.repeat(nestDepth * 4);
        let firstLines = Array.from(specializations.keys()).map((spec, i) => {
            let nextLevel = specializations.get(spec);
            let isLeaf = nextLevel.size === 0;
            let id = getIdForPattern(spec);
            let condition = `${indent}${i > 0 ? 'else ' : ''}if (${id}.match(address)) `;
            let consequent = isLeaf ? `return ${id};\n` : `{\n${getBody(nextLevel, spec, nestDepth + 1)}${indent}}\n`;
            return condition + consequent;
        });
        let lastLine = `${indent}return ${getIdForPattern(fallback)};\n`;
        return firstLines.join('') + lastLine;
    }

    // TODO: doc...
    let lines = [
        ...normalizedPatterns.map((npat, i) => `let ${getIdForPattern(npat)} = normalizedPatterns[${i}];\n`),
        '',
        'return function getBestMatchingPattern(address) {',
        getBody(patternHierarchy.get(Pattern.UNIVERSAL), Pattern.UNIVERSAL, 1),
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
