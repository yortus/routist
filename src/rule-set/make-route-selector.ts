'use strict';
import {RouteHandler} from './types';
import Pattern from '../pattern';
import Taxonomy, {TaxonomyNode} from '../taxonomy';
// TODO: factor/reduce repeated .toIdentifierParts() calls...





// TODO: ...
// TODO: construct taxonomy from targets? ie don't need it as parameter, can calc it
// TODO: shorten sig to < 120chars
export default function makeRouteSelector(taxonomy: Taxonomy, targetMap: Map<Pattern, RouteHandler>): (address: string) => RouteHandler {

    // TODO: ...
    let patterns = taxonomy.allNodes.map(node => node.pattern);
    let targets = patterns.map(pat => targetMap.get(pat));

    // TODO: doc...
    let lines = [
        ...patterns.map((pat, i) => `var matches_${pat.toIdentifierParts()} = patterns[${i}].match;`),
        ...patterns.map((pat, i) => `var _${pat.toIdentifierParts()} = targets[${i}];`),
        '',
        'return function dispatch(address) {',
        ...getBodyLines(taxonomy.rootNode.specializations, Pattern.UNIVERSAL, 1),
        '};'
    ];
// console.log(lines);
// debugger;

    // TODO: temp testing... capture unmangled Pattern id... remove/fix this!!!
    // TODO: review comment below, copied from make-route-handler.ts...
    // Evaluate the source code into a function, and return it. This use of eval here is safe. In particular, the
    // values in `paramNames` and `paramMappings`, which originate from client code, have been effectively sanitised
    // through the assertions made by `validateNames`. The evaled function is fast and suitable for use on a hot path.
    // -or-
    // Evaluate the source code, and return its result, which is the composite route handler function. The use of eval
    // here is safe. There are no untrusted inputs substituted into the source. The client-provided rule handler
    // functions can do anything (so may be considered untrusted), but that has nothing to do with the use of 'eval'
    // here, since they would need to be called by the route handler whether or not eval was used. More importantly,
    // the use of eval here allows for route handler code that is both more readable and more efficient, since it is
    // tailored specifically to the route being evaluated, rather than having to be generalized for all possible cases.
    let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
// console.log(fn.toString());
// debugger;
    return fn;
}





// TODO: doc...
function getBodyLines(specializations: TaxonomyNode[], fallback: Pattern, nestDepth: number) {
    let indent = '    '.repeat(nestDepth);
    let lines: string[] = [];
    specializations.forEach((node, i) => {
        let id = node.pattern.toIdentifierParts();
        let condition = `${indent}${i > 0 ? 'else ' : ''}if (matches_${id}(address)) `;
        let nextLevel = node.specializations;
        if (nextLevel.length === 0) return lines.push(`${condition}return _${id};`);
        lines = [
            ...lines,
            `${condition}{`,
            ...getBodyLines(nextLevel, node.pattern, nestDepth + 1),
            `${indent}}`
        ];
    });
    lines.push(`${indent}return _${fallback.toIdentifierParts()};`);
    return lines;
}
