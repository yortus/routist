export {default as HttpServer, HttpOptions} from './http-server';
export {default as RouteTable} from './route-table';
export {default as Message} from './message';
export {allow, appData, deny, meta, staticFile, staticFiles} from './route-table-helpers';





// TODO: API:
// - class RouteTable
//   - support extending etc
// - function createHttpServer(rt: RouteTable)
// - decorators for RouteTable properties (pattern decorators)
// - helpers to create route handlers (handler factories)
