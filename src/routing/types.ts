'use strict';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';





// TODO: doc...
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
export type Pathway = Rule[];
