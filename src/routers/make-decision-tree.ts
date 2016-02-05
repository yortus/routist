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
    function getPrologLines(patterns: PatternHierarchy, idPrefix?: string): string[] {
        let lines = Object.keys(patterns).map((sig, i) => {
            let id = `${idPrefix || ''}_${i}`;
            return [
                `let ${id}   =   _['${sig}'];`,
                ...getPrologLines(patterns[sig], id)
            ];
        });
        return [].concat(...lines);
    }


    // TODO: doc...
    function getBodyLines(thisPattern: string, childPatterns: PatternHierarchy, idPrefix?: string): string[] {
        let childLines = Object.keys(childPatterns).map((signature, i) => {
            let id = `${idPrefix || ''}_${i}`;
            return [
                `${i > 0 ? 'else ' : ''}if (${id}(address)) {`,
                ...getBodyLines(signature, childPatterns[signature], id).map(line => '    ' + line),
                `}`
            ];
        });
        let lastLine = `${childLines.length > 0 ? 'else ' : ''}return '${thisPattern}';`;
        return [].concat(...childLines, lastLine);
    }





    let firstLine = `let _ = patternMatchers;`;
    let prolog = getPrologLines(patternHierarchy['…']);
    let body = getBodyLines('…', patternHierarchy['…']);
    let source = [firstLine, '', ...prolog, '', ...body].map(line => '    ' + line).join('\n') + '\n';
    let fn = eval(`(function bestMatch(address) {\n${source}})`);
    //if (1===1)return fn;



    let lines = [
        'let _ = patternMatchers;',
        '',
        ...getPrologLines(patternHierarchy['…']),
        '',
        'return function bestMatch(address) {',
        ...getBodyLines('…', patternHierarchy['…']).map(line => '    ' + line),
        '};'
    ];

    let source2 = lines.join('\n') + '\n';
    console.log(source2);
debugger;
}
