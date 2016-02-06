'use strict';
import getKeysDeep from '../utils/get-keys-deep';
import Hierarchy from '../utils/hierarchy';
import makeMatchFunction from '../patterns/make-match-function';
import Pattern from '../patterns/pattern';





// TODO: ...
type GetBestMatchingPatternSignature = (address: string) => string;





// TODO: ...
export default function makeDecisionTree(patternHierarchy: Hierarchy<Pattern>): GetBestMatchingPatternSignature {

    // TODO: ...
    let patterns = getKeysDeep(patternHierarchy);

    // TODO: ...
    type QuickMatch = (address: string) => boolean;
    let patternMatchers = patterns.reduce((map, pat) => {
        let match = makeMatchFunction(pat.normalized.source);
        map[pat.source] = (address: string) => match(address) !== null;
        return map;
    }, <{[pattern: string]: QuickMatch}>{});


    // TODO: ...
    function getPrologLines(patterns: Hierarchy<Pattern>): string[] {
        let lines = Array.from(patterns.keys()).map(pat => {
            let id = getIdForPatternSignature(pat.normalized.source, '__', '__');
            return [
                `let ${id} = patternMatchers['${pat}'];`,
                ...getPrologLines(patterns.get(pat))
            ];
        });
        return dedupe([].concat(...lines));
    }


    // TODO: doc...
    function getBodyLines(thisPattern: Pattern, childPatterns: Hierarchy<Pattern>): string[] {
        let childLines = Array.from(childPatterns.keys()).map((pat, i) => {
            let id = getIdForPatternSignature(pat.normalized.source, '__', '__');
            return [
                `${i > 0 ? 'else ' : ''}if (${id}(address)) {`,
                ...getBodyLines(pat, childPatterns.get(pat)).map(line => '    ' + line),
                `}`
            ];
        });
        let lastLine = `${childLines.length > 0 ? 'else ' : ''}return '${thisPattern}';`;
        return [].concat(...childLines, lastLine);
    }


    let lines = [
        ...getPrologLines(patternHierarchy.get(Pattern.UNIVERSAL)),
        '',
        'return function getBestMatchingPatternSignature(address) {',
        ...getBodyLines(Pattern.UNIVERSAL, patternHierarchy.get(Pattern.UNIVERSAL)).map(line => '    ' + line),
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
