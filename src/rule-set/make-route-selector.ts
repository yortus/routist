'use strict';
import {Handler} from './types';
import Pattern from '../pattern';
import Taxonomy, {TaxonomyNode} from '../taxonomy';
// TODO: factor/reduce repeated .toIdentifierParts() calls...





// TODO: ...
// TODO: construct taxonomy from targets? ie don't need it as parameter, can calc it
// TODO: shorten sig to < 120chars
export default function makeRouteSelector(taxonomy: Taxonomy, targetMap: Map<Pattern, Handler>): (address: string) => Handler {

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
