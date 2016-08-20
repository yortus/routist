import Pattern from '../pattern';
import RouteHandler from './route-handler';
import Taxonomy, {TaxonomyNode} from '../taxonomy';





/**
 * Generates a function that, given an address, returns the best-matching route handler from the given list of
 * candidates. The returned selector function is generated for maximum readability and efficiency, using conditional
 * constructs that follow the branches of the given `taxonomy`.
 * @param {Taxonomy} taxonomy - The arrangement of patterns on which to base the returned selector function.
 * @param {Map<Pattern, RouteHandler>} candidates - The route handlers for each pattern in the given `taxonomy`.
 * @returns {(address: string) => RouteHandler} The generated route selector function.
 */
export default function makeRouteSelector(taxonomy: Taxonomy, candidates: Map<Pattern, RouteHandler>): RouteSelector {

    // Get all the patterns in the taxomony as a list, and their corresponding handlers in a parallel list.
    let patterns = taxonomy.allNodes.map(node => node.pattern);
    let handlers = patterns.map(pat => candidates.get(pat));

    // Generate a unique pretty name for each pattern, suitable for use in the generated source code.
    let patternNames = patterns.map(p => p.toIdentifier());

    // Generate the combined source code for selecting the best route handler. This includes local variable declarations
    // for all the match functions and all the candidate route handler functions, as well as the dispatcher function
    // housing all the conditional logic for selecting the best route handler based on address matching.
    let lines = [
        ...patternNames.map((name, i) => `var matches${name} = patterns[${i}].match;`),
        ...patternNames.map((name, i) => `var ${name} = handlers[${i}];`),
        'return function dispatch(address) {',
        ...generateDispatchSourceCode(taxonomy.rootNode.specializations, Pattern.ANY, 1),
        '};'
    ];

    // Evaluate the source code, and return its result, which is the route selector function. The use of eval here is
    // safe. There are no untrusted inputs substituted into the source. More importantly, the use of eval here allows
    // for route selection code that is both more readable and more efficient, since it is tailored specifically to the
    // give taxonomy of patterns, rather than having to be generalized for all possible cases.
    let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
    return fn;
}





/** A RouteSelector function takes an address string and returns the best-matching route handler for it. */
export type RouteSelector = (address: string) => RouteHandler;





/** Helper function to generate source code for part of the dispatcher function used for route selection. */
function generateDispatchSourceCode(specializations: TaxonomyNode[], fallback: Pattern, nestDepth: number) {

    // Make the indenting string corresponding to the given `nestDepth`.
    let indent = '    '.repeat(nestDepth);

    // Recursively generate the conditional logic block to select among the given patterns.
    let lines: string[] = [];
    specializations.forEach((node, i) => {
        let patternName = node.pattern.toIdentifier();
        let condition = `${indent}${i > 0 ? 'else ' : ''}if (matches${patternName}(address)) `;
        let nextLevel = node.specializations;
        if (nextLevel.length === 0) return lines.push(`${condition}return ${patternName};`);
        lines = [
            ...lines,
            `${condition}{`,
            ...generateDispatchSourceCode(nextLevel, node.pattern, nestDepth + 1),
            `${indent}}`
        ];
    });

    // Add a line to select the fallback pattern if none of the more specialised patterns matched the address.
    lines.push(`${indent}return ${fallback.toIdentifier()};`);
    return lines;
}
