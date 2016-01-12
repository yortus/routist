'use strict';
import Request from './request';
import Response from './response';
import parsePattern from './parse-pattern';
import makePatternMatcher from './make-pattern-matcher';


// TODO: doc...
export default function normalizeHandler(pattern: string, handler: Handler): CanonicalHandler {

    let patternAST = parsePattern(pattern);
    let matchPattern = makePatternMatcher(pattern);
    let handlerParamNames = getParamNames(handler);

    let canonicalHandler: CanonicalHandler = <any> ((request: Request) => {

        let pathname = request.pathname;
        let matches = matchPattern(pathname);
        if (matches === null) {
            // TODO: should never get here due to invariants - only gets called if pathname already matched against pattern
            throw new Error('internal error');
        }
        else {

            // TODO: inject args... ensure all accounted for both ways...
            let argNames = Object.keys(matches);




        }
        
                



    });
    canonicalHandler.type = handler.type;
    return canonicalHandler;
}


// TODO: doc...
interface CanonicalHandler extends Handler {
    (request: Request): Response;
}


// TODO: doc...
interface Handler {
    (...args): Response;
    type: string; // TODO: enum? consts?
}






// TODO: doc...
// Source: http://stackoverflow.com/a/31194949/1075886
function getParamNames(func: Function) {
    return (func + '')
        .replace(/\s+/g, '') // strip spaces
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip simple comments
        .split('){',1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]
}
