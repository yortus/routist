'use strict';
// import * as assert from 'assert';
// import {inspect} from 'util';
var get_keys_deep_1 = require('./get-keys-deep');
var pattern_1 = require('../patterns/pattern');
// TODO: ...
function makeDecisionTree(patternHierarchy) {
    // TODO: ...
    let patternSignatures = get_keys_deep_1.default(patternHierarchy);
    let quickMatchers = patternSignatures.reduce((map, sig) => {
        let p = new pattern_1.default(sig);
        map[sig] = function quickMatch(address) { return p.match(address) !== null; };
        return map;
    }, {});
    // TODO: ...
    function getBestMatchingPatternSignature(address, currentBest, moreSpecificCandidates) {
        // Construct a function that tries all the more specific candidates.
        let candidateSignatures = Object.keys(moreSpecificCandidates);
        let candidateMatchers = candidateSignatures.map(sig => quickMatchers[sig]);
        function tryMoreSpecificCandidates(address) {
            for (let i = 0; i < candidateMatchers.length; ++i) {
                if (candidateMatchers[i](address))
                    return candidateSignatures[i];
            }
            return null;
        }
        let better = tryMoreSpecificCandidates(address);
        if (!better)
            return currentBest;
        return getBestMatchingPatternSignature(address, better, moreSpecificCandidates[better]);
    }
    ;
    // TODO: ...
    return address => getBestMatchingPatternSignature(address, '…', patternHierarchy['…']);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeDecisionTree;
//# sourceMappingURL=make-decision-tree.js.map