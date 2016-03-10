'use strict';





// TODO: doc...
export default RouteHandler;
type RouteHandler = (address: string, request: Request) => Response;
export interface Request {}
export interface Response {}
