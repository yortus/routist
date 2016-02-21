'use strict';
import Pattern from '../pattern';
import Request from '../request';
import Response from '../response';





// TODO: doc...
export type RuleSet = { [pattern: string]: Function };
// TODO: pass address to downstream via closure created for every request
//       - it's only ~20% slower than explicit addr passing, and at least as fast as caching by addr
//       - see: http://jsperf.com/54327545112451459541954/2





// TODO: incorporate this old doc...
// /**
//  * A handler provides a standarized means for transforming a request to a response,
//  * according to the particulars of the pattern/action pair it was constructed with.
//  */


// TODO: doc...
// TODO: temp change sig to find site needing attention...
export type Handler = (address: string, request: Request) => Response;


// TODO: doc...
// TODO: 'address' is sneakily passed as 'this' via Function#call
//       - Function#call is about as fast as a direct call in V8 - see https://jsperf.com/function-calls-direct-vs-apply-vs-call-vs-bind/6
//       - annotate with 'this=Address' (where type Address = string) when TS#6018 lands: https://github.com/Microsoft/TypeScript/issues/6018
export type PartialHandler = (address: string, request: Request) => Response;


// TODO: doc...
// TODO: note this=Address comments above apply here too...
export type GeneralHandler = (address: string, request: Request, downstream: Handler) => Response;





// TODO: doc...
export interface Rule {
    pattern: Pattern;
    handler: Handler; // TODO:. doc.. Each rule's handler is normalized.
}





// TODO: doc...
// TODO: a list of rules ordered from most general to most specific, where for all N rule N is a superset of rule N+1
export interface Route extends Array<Rule> { }
