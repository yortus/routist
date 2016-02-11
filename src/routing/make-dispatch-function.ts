'use strict';
import {Graph, getAllGraphNodes} from '../util';
import makePatternIdentifier from './make-pattern-identifier';
import Pattern from '../patterns/pattern';
// TODO: factor/reduce repeated makePatternIdentifier calls...





// TODO: ...
// TODO: construct patternHierarchy from targets? ie don't need it as parameter, can calc it
// TODO: shorten sig to < 120chars
export default function makeDispatchFunction<T>(patternHierarchy: Graph<Pattern>, targetMap: Map<Pattern, T>): (address: string) => T {

    // TODO: ...
    let patterns = getAllGraphNodes(patternHierarchy);
    let targets = patterns.map(pat => targetMap.get(pat));

    // TODO: doc...
    function getBody(specializations: Graph<Pattern>, fallback: Pattern, nestDepth: number): string {
        let indent = ' '.repeat(nestDepth * 4);
        let firstLines = Array.from(specializations.keys()).map((spec, i) => {
            let nextLevel = specializations.get(spec);
            let isLeaf = nextLevel.size === 0;
            let id = makePatternIdentifier(spec);
            let condition = `${indent}${i > 0 ? 'else ' : ''}if (matches${id}(address)) `;
            let consequent = isLeaf ? `return targetFor${id};\n` : `{\n${getBody(nextLevel, spec, nestDepth + 1)}${indent}}\n`; // TODO: shorten to <120
            return condition + consequent;
        });
        let lastLine = `${indent}return targetFor${makePatternIdentifier(fallback)};\n`;
        return firstLines.join('') + lastLine;
    }

    // TODO: doc...
    let lines = [
        ...patterns.map((pat, i) => `let matches${makePatternIdentifier(pat)} = patterns[${i}].match;\n`),
        ...patterns.map((pat, i) => `let targetFor${makePatternIdentifier(pat)} = targets[${i}];\n`),
        '',
        'return function dispatch(address) {',
        getBody(patternHierarchy.get(Pattern.UNIVERSAL), Pattern.UNIVERSAL, 1),
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
