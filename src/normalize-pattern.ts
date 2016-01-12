'use strict';
import parsePattern from './parse-pattern';


/**
 * Returns the canonical representation of the given pattern.
 * Patterns that match the same set of pathnames are guaranteed
 * to have the same canonical representation.
 */
export default function normalizePattern(pattern: string): string {
    let ast = parsePattern(pattern);
    return ast.canonical;
}
