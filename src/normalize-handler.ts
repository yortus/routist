'use strict';
import Request from './request';
import Response from './response';
import parsePattern from './parse-pattern';
import makePatternMatcher from './make-pattern-matcher';


// TODO: doc...
export default function normalizeHandler(pattern: string, handler: (...args: any[]) => Response): CanonicalHandler {

    // Analyze the pattern and the handler.
    let patternAST = parsePattern(pattern);
    let matchPattern = makePatternMatcher(pattern);
    let paramNames = getParamNames(handler);
    let captureNames = matchPattern.captureNames;
    
    // Ensure capture names are legal. In particular, check for reserved names.
    // TODO: also disallow any name that might be on the Object prototype...
    let reservedNames = ['request', 'req', 'rq', 'tunnel'];
    reservedNames.forEach(reservedName => {
        if (captureNames.indexOf(reservedName) !== -1) {
            throw new Error(`Reserved name '${reservedName}' used as capture name in pattern '${pattern}'`);
        }
    });

    // Throw an error if there are named captures in the pattern with no corresponding parameter in the handler.
    let unusedCaptures = captureNames.filter(name => paramNames.indexOf(name) === -1);
    if (unusedCaptures.length > 0) {
        throw new Error(`Unused captures: ${unusedCaptures.join(', ')}`); // TODO: improve error message
    }

    // Throw an error if the handler has parameters that do not correspond to a named capture or to a built-in.
    let unsatisfiedParams = paramNames.filter(name => reservedNames.indexOf(name) === -1 && captureNames.indexOf(name) === -1);
    if (unsatisfiedParams.length > 0) {
        throw new Error(`Unsatisfied parameters: ${unsatisfiedParams.join(', ')}`); // TODO: improve error message
    }

    // Create and return an equivalent handler in normalized form.
    let canonicalHandler = makeCanonicalHandler(handler, paramNames, matchPattern);
    return canonicalHandler;
}


// TODO: doc...
export interface CanonicalHandler {
    (request: Request, tunnel: (request?: Request) => Response): Response;
}


// TODO: doc...
// Source: http://stackoverflow.com/a/31194949/1075886
function getParamNames(func: Function) {
    let result = func.toString()
        .replace(/\s+/g, '') // strip all whitespace
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip simple comments
        .split(/\)(?:\{|(?:\=\>))/,1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]
    return result;
}





// TODO: doc...
var dummy = false ? makePatternMatcher('') : null;
type MatchFunction = typeof dummy;





// TODO: doc precond - capture name cannot be any of: ['request', 'req', 'rq', 'tunnel']
function makeCanonicalHandler(rawHandler: Function, paramNames: string[], matchPattern: MatchFunction): CanonicalHandler {


    let isDecorator = paramNames.indexOf('tunnel') !== -1;
    let paramMappings = matchPattern.captureNames.reduce((map, name) => (map[name] = `paramBindings.${name}`, map), {});
    paramMappings['req'] = paramMappings['rq'] = 'request';


    let source = `(function (request, tunnel) {

        let paramBindings = matchPattern(request.pathname);
        if (paramBindings === null) return null;

        var response;
        ${isDecorator ? '' : `
        response = tunnel(request);
        if (response !== null) return response;
        `}

        response = rawHandler(${paramNames.map(name => paramMappings[name] || name).join(', ')});
        return response;
    })`;


    let canonicalHandler = eval(source);
    return canonicalHandler;
}
