export {default as HttpServer, HttpServerOptions} from './http-server';
export {default as Router} from './router';
export {default as Message} from './message';
export {appData, meta, staticFile, staticFiles} from './route-helpers';
export {allow, deny} from './route-decorators';





// TODO: API:
// - class RouteTable
//   - support extending etc
// - function createHttpServer(rt: RouteTable)
// - decorators for RouteTable properties (pattern decorators)
// - helpers to create route handlers (handler factories)
