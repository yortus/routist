'use strict';
import parsePattern from './parse-pattern';


/**
 * Returns a function that attempts to match a given pathname against `pattern`.
 * For successful matches, the returned function returns a hash containing the
 * name/value pairs for each named capture in the pattern. For failed matches,
 * the returned function returns null.
 * NB: Pattern matching is case-sensitive.
 */
export default function makePatternMatcher(pattern: string) {
    let patternAST = parsePattern(pattern);
    let recogniser = makePathnameRecogniser(patternAST.canonical);
    function match(pathname: string): { [name: string]: string; } {
        let matches = pathname.match(recogniser);
        if (!matches) return null;
        let result = patternAST.captureNames.reduce((result, name, i) => {
            if (name !== '?') result[name] = matches[i + 1];
            return result;
        }, <any> {});
        return result;
    }
    return match;
}


/**
 * Constructs a regular expression that matches all pathnames recognised by the given pattern.
 * Each globstar/wildcard in the pattern corresponds to a capture group in the regular expression.
 */
function makePathnameRecogniser(pattern: string) {
    let re = pattern.split('').map(c => {
        if (c === '*') return '([^\\/]*)';
        if (c === '…') return '(.*)';
        if (['/._-'].indexOf(c) !== -1) return `\\${c}`;
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}
