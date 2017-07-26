## To Do:
- [ ] more future-proof Handler typing
  - [ ] change Handler signature: pass a `Context` object that contains `request`, `response`, `user`
  - [ ] better name for `Context`? eg: `Message`, `Exchange`, `Interaction`, `RequestResponse`, `Dispatch`
  - [ ] future expansion: add a `type` property (usually 'http', but could be websocket, rpc, etc)





## Done:
- [x] incorporate tslint (same rules as multimethods)
- [x] use `debug` module for logging





## Decisions:
- [ ] Project structure:
```
    src/
    |-- http-server/
        |-- http-server.ts
        |-- index.ts
        |-- normal-options.ts
        |-- normalise-options.ts
    |-- route-table/
        |-- handler.ts
        |-- index.ts
        |-- route-table.ts
    |-- route-table-decorators/
        |-- allow.ts
        |-- deny.ts
        |-- index.ts
    |-- route-table-helpers/
        |-- app-data.ts
        |-- http-api.ts
        |-- index.ts
        |-- meta.ts
        |-- not-found.ts
        |-- static-file.ts
        |-- static-files.ts
    |-- util/
        |-- multimethods-express-middleware.ts
    |-- http-server-options.ts
    |-- index.ts
```





- [ ] Built-in features:
  - [ ] route management
  - [ ] static file handling
  - [ ] session management (with extension points)
  - [ ] permissions system (with extension points)
  - [ ] RPC - clientside and serverside support





```ts
function createRouterMiddleware(): RouterMiddleware;
interface RouterMiddleware extends express.RequestHandler {
    router: Router;
}


class MyRoutes extends Router {

    '...' = [
        permit('/u/*'),
        reject('/u/bob'),
        logStuff
    ];

    '/foo' = raw(ctx => {});

    '/bar' = [
        reject(depts.it)
        json({bar: 'bar'})
    ];

    '/acct/login' = raw(ctx => { ctx.username = ctx.request.query.u; });
}


// class static calls
let server = new HttpServer({ port: 1337 });
server.router = MyRoutes;
server.start();
server.stop();



interface Context {
    request: Request;
    response: Response;

    // getter & setter:
    username: string|number|GUEST; // guest, none, logged_out, nobody, anon, unknown, unauthorised, not_set, unset, unchecked



}

// pass, permit, warrant, license, clearance, ticket, badge, seal, stamp, charter, consent, order, passport, visa, voucher, standing, right

// allow/deny, accept/reject, permit/refuse, len/ban, allow/block
```
