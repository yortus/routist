




/** A route handler provides a standarized means for transforming an address/request pair to a response. */
type RouteHandler = (address: string, request: Request) => (Response | PromiseLike<Response>);
export default RouteHandler;
export interface Request {}
export interface Response {}
