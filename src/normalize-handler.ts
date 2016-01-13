'use strict';
import Request from './request';
import Response from './response';
import parsePattern from './parse-pattern';
import makePatternMatcher from './make-pattern-matcher';


// TODO: doc...
// TODO: future optimisation: eval a wrapper function that statically passes args from regex captures and from `request`
export default function normalizeHandler(pattern: string, handler: (...args: any[]) => Response): (request: Request) => Response {

    // TODO: ...
    let patternAST = parsePattern(pattern);
    let matchPattern = makePatternMatcher(pattern);
    let paramNames = getParamNames(handler);

    // TODO: ...
    let canonicalHandler = ((request: Request) => {

        // TODO: ...
        let pathname = request.pathname;
        let matches = matchPattern(pathname);
        if (matches === null) {

            // TODO: should never get here due to invariants - only gets called if pathname already matched against pattern
            throw new Error('internal error');
        }
        else {

            // TODO: inject args... ensure all accounted for both ways...
            let argNames = Object.keys(matches);

            // TODO: find captures with no matching param...
            let unusedCaptures = argNames.filter(name => paramNames.indexOf(name) === -1);
            if (unusedCaptures.length > 0) {
                throw new Error(`Unused captures: ${unusedCaptures.join(', ')}`); // TODO: improve error message
            }

            // TODO: find params with no matching capture...
            let unsatisfiedParams = paramNames.filter(name => ['request', 'req', 'rq'].indexOf(name) === -1 && argNames.indexOf(name) === -1);
            if (unsatisfiedParams.length > 0) {
                throw new Error(`Unsatisfied Parameters: ${unsatisfiedParams.join(', ')}`); // TODO: improve error message
            }

            // TODO: ...
            let args = paramNames.map(name => ['request', 'req', 'rq'].indexOf(name) !== -1 ? request : matches[name]);
            let result = handler.apply(null, args);
            return result;
        }
    });
    return canonicalHandler;
}


// TODO: doc...
// TODO: doesn't work for arrow functions...
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
