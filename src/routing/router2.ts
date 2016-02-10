'use strict';
import * as assert from 'assert';
import {inspect} from 'util';
import {getAllGraphNodes, getLongestCommonPrefix} from '../util';
import Handler from './handler';
import hierarchizePatterns from '../patterns/hierarchize-patterns';
import isDecorator from './is-decorator';
import makeNormalizedHandlerFunction from './make-normalized-handler-function';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';
import Route from './route';
import walkPatternHierarchy from './walk-pattern-hierarchy';





// TODO: ...
export default function test(routeTable: {[pattern: string]: Function}): Map<Pattern, Route> {

    // TODO: ...
    let patterns = Object.keys(routeTable).map(patternSource => new Pattern(patternSource));
    let handlers = patterns.map(pattern => makeNormalizedHandlerFunction(pattern, routeTable[pattern.toString()]));

    // TODO: add special universal fallback rule...
    patterns.push(Pattern.UNIVERSAL);
    handlers.push(universalHandler);

    // TODO: get pattern hierarchy...
    let patternHierarchy = hierarchizePatterns(patterns);
    let normalizedPatterns = getAllGraphNodes(patternHierarchy);

    // TODO: for each pattern, get the list of rules that are equal-best matches for it...
    // TODO: assert 1..M such rules for each pattern signature
    let handlersForPattern = normalizedPatterns.reduce((map, npat) => {

        //TODO: bug here... temp testing...
        //debugger;
        let hs = handlers.filter((_, i) => patterns[i].normalized === npat);
        
        
        map.set(npat, handlers.filter((_, i) => patterns[i].normalized === npat));
        return map;
    }, new Map<Pattern, Handler[]>());

    // TODO: add no-op rules so that for each signature there are 1..M rules
    // TODO: review this... always correct to use no-op function in these cases? Even for ROOT?
    normalizedPatterns.forEach(npat => {
        let handlers = handlersForPattern.get(npat);
        if (handlers.length > 0) return;
        handlers.push(noop);
    });
    function noop() { return null; } // TODO: put elsewhere? Use Function.empty?

    // Order equal-best rules using tie-break rules. Fail if any ambiguities remain.
    // TODO: improve error message/handling in here...
    normalizedPatterns.forEach(npat => {
        let candidates = handlersForPattern.get(npat);
        candidates.sort((handlerA, handlerB) => {
            let ruleA = { pattern: patterns[handlers.indexOf(handlerA)], handler: handlerA };
            let ruleB = { pattern: patterns[handlers.indexOf(handlerB)], handler: handlerB };
            let moreSpecificRule = tieBreakFn(ruleA, ruleB);
            assert(moreSpecificRule === ruleA || moreSpecificRule === ruleB, `ambiguous rules - which is more specific? A: ${inspect(ruleA)}, B: ${inspect(ruleB)}`); // TODO: test/improve this message
            assert.strictEqual(moreSpecificRule, tieBreakFn(ruleB, ruleA)); // consistency check
            return moreSpecificRule === ruleA ? 1 : -1;
        });
    });

    // TODO: for each pattern signature, get the list of paths through the pattern hierarchy that lead to it
    let patternWalks = walkPatternHierarchy(patternHierarchy, path => path);
console.log(patternWalks);
debugger;

    // TODO: map from walks-of-patterns to walks-of-rules
    let handlerWalks = patternWalks.map(patternWalk => patternWalk.reduce(
        (handlerWalk, pattern) => handlerWalk.concat(handlersForPattern.get(pattern)),
        <Handler[]>[]
    ));
//console.log(handlerWalks);


    // TODO: for each pattern signature, get the ONE path or fail trying...
    let handlerWalkForPattern = normalizedPatterns.reduce((map, npat) => {

        // TODO: inefficient! review this...
        let candidates = handlerWalks.filter(handlerWalk => {
            let finalHandler = handlerWalk[handlerWalk.length - 1];
            let finalPattern = patterns[handlers.indexOf(finalHandler)];
            return finalPattern.normalized === npat.normalized;
        });

        // TODO: ... simple case... explain...
        if (candidates.length === 1) {
            map.set(npat, candidates[0]);
            return map;
        }

        // Find the longest common prefix and suffix of all the candidates.
        let prefix = getLongestCommonPrefix(candidates);
        let suffix = getLongestCommonPrefix(candidates.map(cand => cand.slice().reverse())).reverse(); // TODO: revise... inefficient copies...

        // TODO: possible for prefix and suffix to overlap? What to do?

        // Ensure the non-common parts contain NO decorators.
        candidates.forEach(cand => {
            let choppedHandlers = cand.slice(prefix.length, -suffix.length);
            if (choppedHandlers.every(handler => !isDecorator(handler))) return;
            // TODO: improve error message/handling
            throw new Error(`Multiple routes to '${npat}' with different decorators`);
        });

        // Synthesize a 'crasher' handler that throws an 'ambiguous' error.
        let ambiguousFallbacks = candidates.map(cand => cand[cand.length - suffix.length - 1]);
        let crasher: Handler = function crasher(request): any {
            // TODO: improve error message/handling
            throw new Error(`Multiple possible fallbacks from '${npat}: ${ambiguousFallbacks.map(fn => fn.toString())}`);
        }

        // final composite rule: splice of common prefix + crasher + common suffix
        map.set(npat, [].concat(prefix, crasher, suffix));
        return map;
    }, new Map<Pattern, Handler[]>());
//console.log(handlerWalkForPattern);


    // reduce each signature's handler walk down to a simple handler function.
    const noMore = (rq: Request) => <Response> null;
    let routes = normalizedPatterns.reduce((map, npat) => {
        let handlerWalk = handlerWalkForPattern.get(npat);
        let name = patterns[handlers.indexOf(handlerWalk[handlerWalk.length - 1])].toString(); // TODO: convoluted and inefficient. Fix this.
        return map.set(npat, new Route(name, handlerWalk));
    }, new Map<Pattern, Route>());

    return routes;
}





// TODO: what should the universal handler really do? Must not be transport-specific.
const universalHandler = (request): any => { throw new Error('404!'); };





// TODO: this should be passed in or somehow provided from outside...
// TODO: return the WINNER, a.k.a. the MORE SPECIFIC rule
// TODO: universalHandler must ALWAYS be the least specific rule
interface Ruleish { pattern: Pattern; handler: Handler; } // TODO: where 2 put? keep?
function tieBreakFn(a: Ruleish, b: Ruleish): Ruleish {
    if (a.handler === universalHandler) return b;
    if (b.handler === universalHandler) return a;
    if (a.pattern.comment < b.pattern.comment) return a;
    if (b.pattern.comment < a.pattern.comment) return b;
}
