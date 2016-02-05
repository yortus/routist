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
    function getPrologLines(patterns: PatternHierarchy, getNextId: () => number): string[] {
        let lines = Object.keys(patterns).map((sig, i) => {
            let id = `_${getNextId()}`;
            return [
                `let ${id}   =   _['${sig}'];`,
                ...getPrologLines(patterns[sig], getNextId)
            ];
        });
        return [].concat(...lines);
    }


    // TODO: doc...
    function getBodyLines(thisPattern: string, childPatterns: PatternHierarchy, getNextId: () => number): string[] {
        let childLines = Object.keys(childPatterns).map((signature, i) => {
            let id = `_${getNextId()}`;
            return [
                `${i > 0 ? 'else ' : ''}if (${id}(address)) {`,
                ...getBodyLines(signature, childPatterns[signature], getNextId).map(line => '    ' + line),
                `}`
            ];
        });
        let lastLine = `${childLines.length > 0 ? 'else ' : ''}return '${thisPattern}';`;
        return [].concat(...childLines, lastLine);
    }




    function makeGetNextId() {
        let id = 0;
        return () => ++id;
    }

debugger;
    let firstLine = `let _ = patternMatchers;`;
    let prolog = getPrologLines(patternHierarchy['…'], makeGetNextId());
    let body = getBodyLines('…', patternHierarchy['…'], makeGetNextId());
    let source = [firstLine, '', ...prolog, '', ...body].map(line => '    ' + line).join('\n') + '\n';
    let fn = eval(`(function bestMatch(address) {\n${source}})`);
    if (1===1)return fn;



//     let lines = [
//         'let _ = patternMatchers;',
//         '',
//         ...getPrologLines(patternHierarchy['…']),
//         '',
//         'return function bestMatch(address) {',
//         ...getBodyLines('…', patternHierarchy['…']).map(line => '    ' + line),
//         '};'
//     ];
// 
//     let source2 = lines.join('\n') + '\n';
//     console.log(source2);
// debugger;
}


function getIdForPatternSignature(signature: string, prefix?: string) {
    return (prefix || '') + signature
        .split('')
        .map(c => {
            if (/[a-zA-Z0-9_]/.test(c)) return c;
            if (c === '/') return '〳'; // (U+3033)
            if (c === '.') return 'ˌ'; // (U+02CC)
            if (c === '-') return 'ー'; // (U+30FC)
            if (c === ' ') return 'ㆍ'; // (U+318D)
            if (c === '…') return '﹍'; // (U+FE4D)
            if (c === '*') return 'ᕽ'; // (U+157D)
            throw new Error(`Unrecognized character '${c}' in pattern signature '${signature}'`);
        })
        .join('');
}
