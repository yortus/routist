'use strict';





// /**
//  * A handler provides a standarized means for transforming a request to a response,
//  * according to the particulars of the pattern/action pair it was constructed with.
//  */





// TODO: doc...
export default RouteHandler;
type RouteHandler = (address: string, request: Request) => Response;
export interface Request {}
export interface Response {}
