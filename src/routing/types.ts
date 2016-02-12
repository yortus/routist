'use strict';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';









// TODO: doc...
// TODO: Put Handler everywhere literal type (request: Request) => Response appears


// TODO: incorporate this old doc...
// /**
//  * A handler provides a standarized means for transforming a request to a response,
//  * according to the particulars of the pattern/action pair it was constructed with.
//  */


export type Handler = (request: Request) => Response;


export type PartialHandler = (request: Request) => Response;





// TODO: doc...
export type GeneralHandler = (request: Request, downstream: Handler) => Response;










// TODO: doc...
export interface Rule {
    pattern: Pattern;
    handler: Handler;
}
