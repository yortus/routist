'use strict';
import getAllPatternsInTaxonomy from '../taxonomy/get-all-patterns-in-taxonomy';
import makePatternIdentifier from './make-pattern-identifier';
import Pattern from '../pattern';
import Taxonomy from '../taxonomy/taxonomy';
// TODO: factor/reduce repeated makePatternIdentifier calls...





// TODO: ...
// TODO: construct taxonomy from targets? ie don't need it as parameter, can calc it
// TODO: shorten sig to < 120chars
export default function makeDispatcher<T>(taxonomy: Taxonomy, targetMap: Map<Pattern, T>): (address: string) => T {

    // TODO: ...
    let patterns = getAllPatternsInTaxonomy(taxonomy);
    let targets = patterns.map(pat => targetMap.get(pat));

    // TODO: doc...
    function getBody(specializations: Taxonomy[], fallback: Pattern, nestDepth: number): string {
        let indent = ' '.repeat(nestDepth * 4);
        let firstLines = specializations.map((spec, i) => {
            let nextLevel = spec.specializations;
            let isLeaf = nextLevel.length === 0;
            let id = makePatternIdentifier(spec.pattern);
            let condition = `${indent}${i > 0 ? 'else ' : ''}if (matches_${id}(address)) `;
            let consequent = isLeaf ? `return _${id};\n` : `{\n${getBody(nextLevel, spec.pattern, nestDepth + 1)}${indent}}\n`; // TODO: shorten to <120
            return condition + consequent;
        });
        let lastLine = `${indent}return _${makePatternIdentifier(fallback)};\n`;
        return firstLines.join('') + lastLine;
    }

    // TODO: doc...
    let lines = [
        ...patterns.map((pat, i) => `let matches_${makePatternIdentifier(pat)} = patterns[${i}].match;\n`),
        ...patterns.map((pat, i) => `let _${makePatternIdentifier(pat)} = targets[${i}];\n`),
        '',
        'return function dispatch(address) {',
        getBody(taxonomy.specializations, Pattern.UNIVERSAL, 1),
        '};'
    ];
// console.log(lines);
// debugger;

    // TODO: temp testing... capture unmangled Pattern id... remove/fix this!!!
    let fn = (function(Pattern) {
        let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
        return fn;
    })(Pattern);
// console.log(fn.toString());
// debugger;
    return fn;
}
