'use strict';
import getKeysDeep from '../utils/get-keys-deep';
import Hierarchy from '../utils/hierarchy';
import makeMatchFunction from '../patterns/make-match-function';
import Pattern from '../patterns/pattern';





// TODO: ...
type GetBestMatchingPattern = (address: string) => Pattern;





// TODO: ...
export default function makeDecisionTree(patternHierarchy: Hierarchy<Pattern>): GetBestMatchingPattern {

    // TODO: ...
    let normalizedPatterns = getKeysDeep(patternHierarchy);

    // TODO: ...
    type QuickMatch = (address: string) => boolean;
    let patternMatchers = normalizedPatterns.reduce((map, npat) => {
        let match = makeMatchFunction(npat);
        map.set(npat, (address: string) => match(address) !== null);
        return map;
    }, new Map<Pattern, QuickMatch>());


    // TODO: ...
    function getPrologLines(patternHierarchy: Hierarchy<Pattern>): string[] {
        let lines = Array.from(patternHierarchy.keys()).map(npat => {
            let id = getIdForPattern(npat, '__', '__');
            return [
                `let ${id} = patternMatchers.get(new Pattern('${npat}'));`, // TODO: temp testing... DON'T construct new Pattern inst here!
                ...getPrologLines(patternHierarchy.get(npat))
            ];
        });
        return dedupe([].concat(...lines));
    }


    // TODO: doc...
    function getBodyLines(thisPattern: Pattern, childPatterns: Hierarchy<Pattern>): string[] {
        let childLines = Array.from(childPatterns.keys()).map((npat, i) => {
            let id = getIdForPattern(npat, '__', '__');
            return [
                `${i > 0 ? 'else ' : ''}if (${id}(address)) {`,
                ...getBodyLines(npat, childPatterns.get(npat)).map(line => '    ' + line),
                `}`
            ];
        });
        let lastLine = `${childLines.length > 0 ? 'else ' : ''}return new Pattern('${thisPattern}');`; // TODO: temp testing... DON'T construct new Pattern inst here!
        return [].concat(...childLines, lastLine);
    }

    // TODO: doc...
    let lines = [
        ...getPrologLines(patternHierarchy.get(Pattern.UNIVERSAL)),
        '',
        'return function getBestMatchingPattern(address) {',
        ...getBodyLines(Pattern.UNIVERSAL, patternHierarchy.get(Pattern.UNIVERSAL)).map(line => '    ' + line),
        '};'
    ];

    // TODO: temp testing... capture unmangled Pattern id... remove/fix this!!!
    let fn = (function(Pattern) {
        let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
        return fn;
    })(Pattern);
    return fn;
}


// TODO: ...
function getIdForPattern(pattern: Pattern, prefix?: string, suffix?: string) {
    return (prefix || '') + pattern.toString()
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
        .join('') + (suffix || '');
}


// TODO: this is a util. Generalize to any element type. Use it also in/with getKeysDeep
function dedupe(strs: string[]): string[] {
    let map = strs.reduce((map, str) => (map[str] = true, map), {});
    return Object.keys(map);
}
