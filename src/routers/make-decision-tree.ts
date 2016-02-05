'use strict';
// import * as assert from 'assert';
// import {inspect} from 'util';
import getKeysDeep from './get-keys-deep';
import {PatternHierarchy} from '../patterns/hierarchize-patterns';
import Pattern from '../patterns/pattern';
//import Request from '../request';
//import Response from '../response';
// import Rule from '../rules/rule';
// import walkPatternHierarchy from './walk-pattern-hierarchy';




// TODO: ...
type GetBestMatchingPatternSignature = (address: string) => string;





// TODO: ...
export default function makeDecisionTree(patternHierarchy: PatternHierarchy): GetBestMatchingPatternSignature {

    if (1===1) return test(patternHierarchy);


    // TODO: ...
    let patternSignatures = getKeysDeep(patternHierarchy);

    //TODO: ...
    type QuickMatch = (address: string) => boolean;
    let quickMatchers = patternSignatures.reduce((map, sig) => {
        let p = new Pattern(sig);
        map[sig] = function quickMatch(address: string) { return p.match(address) !== null; }
        return map;
    }, <{[pattern: string]: QuickMatch}>{});

    // TODO: ...
    function getBestMatchingPatternSignature(address: string, currentBest: string, moreSpecificCandidates: PatternHierarchy) {

        // Construct a function that tries all the more specific candidates.
        let candidateSignatures = Object.keys(moreSpecificCandidates);
        let candidateMatchers = candidateSignatures.map(sig => quickMatchers[sig]);
        function tryMoreSpecificCandidates(address: string) {
            for (let i = 0; i < candidateMatchers.length; ++i) {
                if (candidateMatchers[i](address)) return candidateSignatures[i];
            }
            return null;
        }

        let better = tryMoreSpecificCandidates(address);
        if (!better) return currentBest;
        return getBestMatchingPatternSignature(address, better, moreSpecificCandidates[better]);
    };

    // TODO: ...
    return address => getBestMatchingPatternSignature(address, '…', patternHierarchy['…']);
}





function test(patternHierarchy: PatternHierarchy) {
    
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
//     function getIdsForPatterns(patterns: PatternHierarchy, prefix?: string): string[] {
//         let result: string[] = [];
//         Object.keys(patterns).forEach((sig, i) => {
//             let id = `${prefix || ''}_${i}`;
//             let rest = getIdsForPatterns(patterns[sig], id);
//             result.push(id);
//             result.push.apply(result, rest);
//         });
//         return result;
//     }
//     let ids = getIdsForPatterns(patternHierarchy);
//     console.log(ids);
// debugger;    


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


    function getBodyLines(thisPattern: string, childPatterns: PatternHierarchy, idPrefix?: string, linePrefix?: string): string[] {
        linePrefix = linePrefix || '';
        let result: string[] = [];
        let signatures = Object.keys(childPatterns);
        if (signatures.length > 0) {
            signatures.forEach((sig, i) => {
                let id = `${idPrefix || ''}_${i}`;
                result.push(`${linePrefix}${i > 0 ? 'else ' : ''}if (${id}(address)) {\n`);
                result.push.apply(result, getBodyLines(sig, childPatterns[sig], id, linePrefix + '    '));
                result.push(`${linePrefix}}\n`);
            });
            result.push(`${linePrefix}else {\n`);
            result.push(`${linePrefix}    return '${thisPattern}';\n`);
            result.push(`${linePrefix}}\n`);
        }
        else {
            // TODO: ...
            result.push(`${linePrefix}return '${thisPattern}';\n`);
        }
        return result;
    }
    let body = getBodyLines('…', patternHierarchy['…']);


    let source = prolog.concat(body).map(line => '    ' + line).join('');
    let fn = eval(`(function bestMatch(address) {\n${source}})`);

    return fn;
}





// TODO: temp testing... non recursive optimised construction:
`
    let _ = patternSignatures.map(sig => patterns[sig].match);
    let match0 =    _['…'];
    let match1 =        _['/foo']
    let match2 =            _['/foo/bar']
    let match3 =                _['/foo/bar/baz']
    let match4 =            _['/foo/baz']
    let match5 =        _['/bar']


    if (match1(addr)) {
        if (match2(addr)) {
            if (match3(addr)) {
                return '/foo/bar/baz';
            }
            else {
                return '/foo/bar';
            }
        }
        else if (match4(addr)) {
            return '/foo/baz';
        }
        else {
            return '/foo';
        }
    }
    else if (match5(addr)) {
        return '/bar';
    }
    else {
        return '…';
    }
`;





// TODO: temp testing... non recursive optimised construction:
`
    if (false) {
    }
    else if (quickMatchFoo(addr)) {
        if (false) {
        }
        else if (quickMatchFooBar(addr)) {
            if (false) {
            }
            else if (quickMatchFooBarBaz(addr)) {
                if (false) {
                }
                else {
                    return '/foo/bar/baz';
                }
            }
            else {
                return '/foo/bar';
            }
        }
        else if (quickMatchFooBaz(addr)) {
            if (false) {
            }
            else {
                return '/foo/baz';
            }
        }
        else {
            return '/foo';
        }
    }
    else if (quickMatchBar(addr)) {
        if (false) {
        }
        else {
            return '/bar';
        }
    }
    else {
        return '…';
    }
`;
