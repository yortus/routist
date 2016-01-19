'use strict';
import Request from './request';
import {Response} from './response';
import parsePattern from './parse-pattern';
import makePatternMatcher from './make-pattern-matcher';


// TODO: doc...
// TODO: future optimisation: eval a wrapper function that statically passes args from regex captures and from `request`
export default function normalizeHandler(pattern: string, handler: (...args: any[]) => Response): Handler {

    // Analyze the pattern and the handler.
    let patternAST = parsePattern(pattern);
    let matchPattern = makePatternMatcher(pattern);
    let paramNames = getParamNames(handler);
    let captureNames = matchPattern.captureNames;
    
    // Ensure capture names are legal. In particular, check for reserved names.
    // TODO: also disallow any name that might be on the Object prototype...
    let reservedNames = ['request', 'req', 'rq', 'handle'];
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
    let canonicalHandler = makeCanonicalHandler2(handler, paramNames, matchPattern);
    return canonicalHandler;
}


// TODO: doc...
export interface Handler {
    (request: Request, traverseInnerHandlers: (request?: Request) => Response): Response;
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





// TODO: add fast/noDebug case that uses eval...
// TODO: doc precond - capture name cannot be any of: ['request', 'req', 'rq', 'handle']
function makeCanonicalHandler(rawHandler: Function, paramNames: string[], matchPattern: MatchFunction): Handler {
    
    let isDecorator = paramNames.indexOf('handle') !== -1;

    return (request: Request, traverseInnerHandlers: (request?: Request) => Response) => {

        // TODO: ...
        let paramBindings: any = matchPattern(request.pathname);
        if (paramBindings === null) return null;

        // TODO: ...
        paramBindings['request'] = paramBindings['req'] = paramBindings['rq'] = request;
        paramBindings['handle'] = (req?: Request) => traverseInnerHandlers(req || request);
        let argValues = paramNames.map(name => paramBindings[name]);

        // TODO: ...
        let response: Response = null;
        if (!isDecorator) {
            response = traverseInnerHandlers(request);
            if (response !== null) return response;
        }
        response = rawHandler.apply(null, argValues);
        return response;
    };
}


var dummy = false ? makePatternMatcher('') : null;
type MatchFunction = typeof dummy;





function makeCanonicalHandler2(rawHandler: Function, paramNames: string[], matchPattern: MatchFunction): Handler {

    let isDecorator = paramNames.indexOf('handle') !== -1;
    let paramMappings = {};
    paramNames.forEach(name => paramMappings[name] = `paramBindings.${name}`);
    paramMappings['request'] = paramMappings['req'] = paramMappings['rq'] = 'request';
    paramMappings['handle'] = 'handle';


    let source = `(function (request, traverseInnerHandlers) {

        ${isDecorator ? `
        var handle = rq => traverseInnerHandlers(rq || request);
        ` : ''}

        let paramBindings = matchPattern(request.pathname);
        if (paramBindings === null) return null;

        var response;
        ${isDecorator ? '' : `
            response = traverseInnerHandlers(request);
            if (response !== null) return response;
        `}

        response = rawHandler(${paramNames.map(name => paramMappings[name])});
        return response;
    })`;


    let canonicalHandler = eval(source);
    return canonicalHandler;
}
