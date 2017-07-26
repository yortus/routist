export {default as HttpServer} from './http-server';
export {default as HttpServerOptions} from './http-server-options';
export {appData, meta, staticFile, staticFiles} from './route-helpers';
export {default as Router} from './router';





// TODO: API:
// - class RouteTable
//   - support extending etc
// - function createHttpServer(rt: RouteTable)
// - decorators for RouteTable properties (pattern decorators)
// - helpers to create route handlers (handler factories)
