'use strict';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';





// TODO: doc... rename this to RuleTable or something else? route now has specific meaning
export type RouteTable = { [pattern: string]: Function };







// TODO: incorporate this old doc...
// /**
//  * A handler provides a standarized means for transforming a request to a response,
//  * according to the particulars of the pattern/action pair it was constructed with.
//  */


// TODO: doc...
export type Handler = (request: Request) => Response;


// TODO: doc...
export type PartialHandler = (request: Request) => Response;


// TODO: doc...
export type GeneralHandler = (request: Request, downstream: Handler) => Response;





// TODO: doc...
export interface Rule {
    pattern: Pattern;
    handler: Handler; // TODO:. doc.. Each rule's handler is normalized.
}





// TODO: doc...
// doc... from most general rule to most specific rule
// TODO: remove this type...
export type Pathway = Rule[];





// TODO: doc...
// TODO: a list of rules ordered from most general to most specific, where for all N rule N is a superset of rule N+1
export interface Route extends Array<Rule> { }
