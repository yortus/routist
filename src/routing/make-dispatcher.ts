'use strict';
import {getAllGraphNodes} from '../util';
import makePatternIdentifier from './make-pattern-identifier';
import Pattern from '../patterns/pattern';
import {PatternNode} from '../patterns/hierarchize-patterns';
// TODO: factor/reduce repeated makePatternIdentifier calls...





// TODO: ...
// TODO: construct patternHierarchy from targets? ie don't need it as parameter, can calc it
// TODO: shorten sig to < 120chars
export default function makeDispatcher<T>(patternHierarchy: PatternNode, targetMap: Map<Pattern, T>): (address: string) => T {

    // TODO: ...
    let patterns = getAllGraphNodes(patternHierarchy).map(node => node.pattern);
    let targets = patterns.map(pat => targetMap.get(pat));

    // TODO: doc...
    function getBody(specializations: PatternNode[], fallback: Pattern, nestDepth: number): string {
        let indent = ' '.repeat(nestDepth * 4);
        let firstLines = specializations.map((spec, i) => {
            let nextLevel = spec.children;
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
        getBody(patternHierarchy.children, Pattern.UNIVERSAL, 1),
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
