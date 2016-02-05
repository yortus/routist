'use strict';
import getKeysDeep from './get-keys-deep';
import {PatternHierarchy} from '../patterns/hierarchize-patterns';
import Pattern from '../patterns/pattern';




// TODO: ...
type GetBestMatchingPatternSignature = (address: string) => string;





// TODO: ...
export default function makeDecisionTree(patternHierarchy: PatternHierarchy): GetBestMatchingPatternSignature {

    // TODO: ...
    let patternSignatures = getKeysDeep(patternHierarchy);

    // TODO: ...
    type QuickMatch = (address: string) => boolean;
    let patternMatchers = patternSignatures.reduce((map, sig) => {
        let p = new Pattern(sig);
        map[sig] = (address: string) => p.match(address) !== null;
        return map;
    }, <{[pattern: string]: QuickMatch}>{});


    // TODO: ...
    function getPrologLines(patterns: PatternHierarchy): string[] {
        let lines = Object.keys(patterns).map(signature => {
            let id = getIdForPatternSignature(signature, '__', '__');
            return [
                `let ${id} = patternMatchers['${signature}'];`,
                ...getPrologLines(patterns[signature])
            ];
        });
        return dedupe([].concat(...lines));
    }


    // TODO: doc...
    function getBodyLines(thisPattern: string, childPatterns: PatternHierarchy): string[] {
        let childLines = Object.keys(childPatterns).map((signature, i) => {
            let id = getIdForPatternSignature(signature, '__', '__');
            return [
                `${i > 0 ? 'else ' : ''}if (${id}(address)) {`,
                ...getBodyLines(signature, childPatterns[signature]).map(line => '    ' + line),
                `}`
            ];
        });
        let lastLine = `${childLines.length > 0 ? 'else ' : ''}return '${thisPattern}';`;
        return [].concat(...childLines, lastLine);
    }


    let lines = [
        ...getPrologLines(patternHierarchy['…']),
        '',
        'return function getBestMatchingPatternSignature(address) {',
        ...getBodyLines('…', patternHierarchy['…']).map(line => '    ' + line),
        '};'
    ];
    let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
    return fn;
}


// TODO: ...
function getIdForPatternSignature(signature: string, prefix?: string, suffix?: string) {
    return (prefix || '') + signature
        .split('')
        .map(c => {
            if (/[a-zA-Z0-9_]/.test(c)) return c;
            if (c === '/') return 'ﾉ'; // (U+FF89)
            if (c === '.') return 'ˌ'; // (U+02CC)
            if (c === '-') return 'ー'; // (U+30FC)
            if (c === ' ') return 'ㆍ'; // (U+318D)
            if (c === '…') return '﹍'; // (U+FE4D)
            if (c === '*') return 'ᕽ'; // (U+157D)
            throw new Error(`Unrecognized character '${c}' in pattern signature '${signature}'`);
        })
        .join('') + (suffix || '');
}


// TODO: this is a util. Use it also in/with getKeysDeep
function dedupe(strs: string[]): string[] {
    let map = strs.reduce((map, str) => (map[str] = true, map), {});
    return Object.keys(map);
}
