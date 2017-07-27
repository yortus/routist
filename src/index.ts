export {default as HttpServer, HttpServerOptions} from './http-server';
export {appData, meta, staticFile, staticFiles} from './route-helpers';
export {default as Router} from './router';





// TODO: API:
// - class RouteTable
//   - support extending etc
// - function createHttpServer(rt: RouteTable)
// - decorators for RouteTable properties (pattern decorators)
// - helpers to create route handlers (handler factories)
