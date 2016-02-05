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
