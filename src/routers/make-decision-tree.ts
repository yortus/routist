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
        let result: string[] = [];
        if (!idPrefix) result.push('let _ = patternMatchers;\n');
        Object.keys(patterns).forEach((sig, i) => {
            let id = `${idPrefix || ''}_${i}`;
            let first = `let ${id}   =   _['${sig}'];\n`;
            let rest = getPrologLines(patterns[sig], id);
            result.push(first);
            result.push.apply(result, rest);
        });
        return result;
    }
    let prolog = getPrologLines(patternHierarchy['…']);


    function getBodyLines(thisPattern: string, childPatterns: PatternHierarchy, idPrefix?: string): string[] {
        let lines: string[] = [];
        let signatures = Object.keys(childPatterns);
        let hasKids = signatures.length > 0;

        signatures.forEach((sig, i) => {
            let id = `${idPrefix || ''}_${i}`;
            lines.push(
                `${i > 0 ? 'else ' : ''}if (${id}(address)) {`,
                ...getBodyLines(sig, childPatterns[sig], id).map(line => '    ' + line),
                `}`
            );
        });

        lines.push(`${hasKids ? 'else ' : ''}return '${thisPattern}';`);


        return lines;
    }
    let body = getBodyLines('…', patternHierarchy['…']).map(line => line + '\n');


    let source = prolog.concat(['\n'], body).map(line => '    ' + line).join('');
    let fn = eval(`(function bestMatch(address) {\n${source}})`);

    return fn;


}
