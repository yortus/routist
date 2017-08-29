## Decisions
- [ ] Architecture: Server/Receiver/Authenticator/Authoriser/Dispatcher

  - [ ] Receiver responsibilities:
    - [ ] exposes a well-known Message format (so authenticator/authoriser/dispatcher may consume it)
    - [ ] produces messages
      - [ ] constructs Message instances, specialised for the protocol of this receiver (e.g., HTTP)
      - [ ] all messages include type and discriminant; rest is protocol-specific
    - [ ] provides means to get/set User associated with message (incl session support if receiver's protocol supports it)

  - [ ] Authenticator responsibilities:
    - [ ] consumes -some- messages
    - [ ] confirms whether a message comes from a particular user by various means (usn/pwd, valid session, oauth, etc)
    - [ ] recognises (only) messages whose effect is to set/clear association between Message and User
    - [ ] sets/clears association between message and user
    - [ ] does not modify messages
    - [ ] all other messages pass through

  - [ ] Authoriser responsibilities:
    - [ ] consumes all messages
    - [ ] determines whether the given message is authorised for the given user
    - [ ] unauthorised messages go no further (i.e., they dont get dispatched)
    - [ ] authorised messages pass through unchanged to dispatch stage

  - [ ] Dispatcher responsibilities:
    - [ ] consumes all authorised messages
    - [ ] finds the best-matching handler(s) for the message
    - [ ] processes the message, including responding in a protocol-specific manner (message instance must allow for this)

  - [ ] Server responsibilities:
    - [ ] chains together receiver + authenticator + authoriser + dispatcher
    - [ ] manages lifecycle on each Message
    - [ ] provides for separate contexts for same kind of receiver etc
    - [ ] provides controls for starting/stopping
    - [ ] handles sync/async cases gracefully




- [ ] Lifecycle: receive > authenticate > authorise > dispatch
- [ ] RouteTable --> Dispatcher
- [ ] Route table helpers --> dispatch helpers
- [ ] Pass protocol (eg 'HTTP') as first part of discrimimant
- [ ] User is-a Role
- [ ] access control --> authorisation
- [ ] authentication






## Todo - High Priority


## Todo - Medium Priority


## Todo - Unassigned Priority
- [ ] add `util.assert` function and replace `throw` stmts wherever appropriate
- [ ] AccessControlConfig: support caching and invalidation
- [ ] Do ACL entries 'inherit' up prototype chains? See TODOs in `access-control-list.ts`
- [ ] ACL policies: allow policy functions to be async/mixed
- [ ] ensure access control middleware is correctly position in middleware stack
  - [ ] investigate:
    - [ ] any possible bypasses?
    - [ ] any server info leaks?
- [ ] HttpServer: implement `stop()` method
- [ ] HttpServer: add useful options for 'Trust Proxy'
  - [ ] supported scenarios:
    - [ ] localhost/debugging
    - [ ] direct serving
    - [ ] behind a local reverse proxy eg nginx
    - [ ] behind a remote reverse proxy
    - [ ] ...any others?
  - [ ] read about useful configs
    - [ ] Express docs
    - [ ] Nginx docs
    - [ ] search for other resources, list below...
- [ ] options (user-supplied) -> configuration (validated & normalised)
  - [x] refactor
  - [ ] transform UserOptions to something more internally appropriate?
- [ ] support more chars in UserTag and RoleTag strings
  - [ ] eg usertags could be emails if the allow: `@ .`
  - [ ] allow anything *except* reserved chars?
- [ ] split up code into `src/server/`, `src/client`, and `src/common`
  - [ ] split up code
  - [ ] build clientside bundle using webpack
  




## Done:
- [x] more future-proof Handler typing
  - [x] change Handler signature: pass a `Message` object that contains `request`, `response`, `user`
  - [x] better name for `Context`? eg: `Message`, `Exchange`, `Interaction`, `RequestResponse`, `Dispatch`
  - [x] future expansion: add a `type` property (usually 'http', but could be websocket, rpc, etc)
- [x] incorporate tslint (same rules as multimethods)
- [x] use `debug` module for logging



```ts
type ClientOptions = Partial<Options>;
interface Options {
    secret: string;
    port: number;
    sessionsDir: string;
    isUser?(user: string): boolean;
    isRole?(role: string): boolean;
    getImpliedRoles(userOrRole: UserTag|RoleTag): RoleTag[];
}




class AccessControlList {
    static for(obj: object): AccessControlList;
    set(subjects: string, operations: string, policy: Policy): void;
    toFunction(options: AccessControlOptions): (msg: Message) => boolean;
    private constructor();
}
```



## Decisions:
- [ ] Access Control Lists
  - [ ] attached to prototype objects indirectly using a WeakMap
  - [ ] getting the ACL for an arbitrary object OBJ:
    - 1. is OBJ null or undefined?
      - if so, return a new blank ACL and EXIT
    - 2. set PROTO := the prototype of OBJ
    - 2. is there an ACL associated with PROTO?
      - If so: result := ACL of PROTO and EXIT
    - 3. 
    - 4. if none found:

      




- [ ] Project structure:
```
    src/
    |-- access-control/
    |   |-- access-control-list.ts
    |   |-- access-control-options.ts
    |   |-- * role-tag, user-tag, to-role-tag, to-user-tag, policy
    |-- clients/
    |   |-- rpc-client/
    |   |   |-- *
    |-- messages/
    |   |-- *
    |-- route-table/
    |   |-- handler.ts
    |   |-- index.ts
    |   |-- route-table.ts
    |-- route-table-helpers/
    |   |-- allow.ts
    |   |-- app-data.ts
    |   |-- deny.ts
    |   |-- http-api.ts
    |   |-- index.ts
    |   |-- meta.ts
    |   |-- not-found.ts
    |   |-- static-file.ts
    |   |-- static-files.ts
    |-- servers/
    |   |-- http-server/
    |   |   |-- express-middleware/
    |   |   |   |-- route-table-adapter.ts
    |   |   |-- http-server.ts
    |   |   |-- http-server-options.ts  // use Partial<> with this
    |   |   |-- validate-options.ts     // both check and normalise - take partial and return non-partial
    |   |-- rpc-server/
    |   |   |-- *
    |-- util/
    |   |-- 
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
