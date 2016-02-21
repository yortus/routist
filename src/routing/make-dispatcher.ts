'use strict';
import makePatternIdentifier from './make-pattern-identifier';
import Pattern from '../pattern';
import Taxonomy, {TaxonomyNode} from '../taxonomy';
// TODO: factor/reduce repeated makePatternIdentifier calls...





// TODO: ...
// TODO: construct taxonomy from targets? ie don't need it as parameter, can calc it
// TODO: shorten sig to < 120chars
export default function makeDispatcher<T>(taxonomy: Taxonomy, targetMap: Map<Pattern, T>): (address: string) => T {

    // TODO: ...
    let patterns = taxonomy.allNodes.map(node => node.pattern);
    let targets = patterns.map(pat => targetMap.get(pat));

    // TODO: doc...
    function getBodyLines(specializations: TaxonomyNode[], fallback: Pattern, nestDepth: number) {
        let indent = ' '.repeat(nestDepth * 4);
        let firstLines: string[] = specializations.reduce((lines, node, i) => {
            let nextLevel = node.specializations;
            let isLeaf = nextLevel.length === 0;
            let id = makePatternIdentifier(node.pattern);
            let condition = `${indent}${i > 0 ? 'else ' : ''}if (matches_${id}(address)) `;

            // let condition = `${indent}${i > 0 ? 'else ' : ''}if (matches_${id}(address)) `;
            // let consequent = isLeaf ? `return _${id};\n` : `{\n${getBody(nextLevel, spec.pattern, nestDepth + 1)}${indent}}\n`; // TODO: shorten to <120
            // return condition + consequent;



            if (isLeaf) {
                let result = lines.concat(`${condition}return _${id};`);
                return result;
            }

            let result = lines.concat([
                `${condition}{`,
                ...getBodyLines(nextLevel, node.pattern, nestDepth + 1),
                `${indent}}`
            ]);
            return result;
        }, <string[]> []);
        let lastLine = `${indent}return _${makePatternIdentifier(fallback)};`;
        return firstLines.concat(lastLine);
    }

    // TODO: doc...
    let lines = [
        ...patterns.map((pat, i) => `let matches_${makePatternIdentifier(pat)} = patterns[${i}].match;`),
        ...patterns.map((pat, i) => `let _${makePatternIdentifier(pat)} = targets[${i}];`),
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
