'use strict';
import * as assert from 'assert';
import Pattern from '../pattern';





// TODO: doc...
// TODO: document that caller is responsible to ensure first char is legal, eg by prepending '_' or similar
export default function makePatternIdentifier(pattern: Pattern) {

    // Use unicode substitutions to create a legal identifier that 'looks' like the pattern.
    // NB: The resulting identifier's may start with a non-letter character and hence be illegal
    // as-is. It is the caller's responsibility to prepend a legal starting character in that case.
    return pattern.normalized.toString()
        .split('')
        .map(c => {
            if (/[a-zA-Z0-9_]/.test(c)) return c;
            if (c === '/') return 'ﾉ'; // (U+FF89)
            if (c === '.') return 'ˌ'; // (U+02CC)
            if (c === '-') return 'ー'; // (U+30FC)
            if (c === ' ') return 'ㆍ'; // (U+318D)
            if (c === '…') return '﹍'; // (U+FE4D)
            if (c === '*') return 'ᕽ'; // (U+157D)
            throw new Error(`Unrecognized character '${c}' in pattern '${pattern}'`);
        })
        .join('');
}
