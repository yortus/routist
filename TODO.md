## TODO 15/11/2017
- [x] handle errors properly throughout the middleware stack
  - [x] in particular, if any routist middleware throws/rejects, it should be handled gracefully
  - [x] use httperr?
- [x] allow fallthrough to non-routist routes if unhandled by `routes`
- [x] optimisation: don't make new access/routes multimethods on every handler change
  - [x] EITHER: add refresh() method to access control and dispatch middleware
  - [x] OR: queue up pending changes from the same tick to the next tick
- [ ] app start/end
- [ ] `user` fluent API


## TODO List 01/11/17
- [ ] `export function createExpressApplication(): express.Application;`
  - [ ] add third party middleware
  - [ ] add middleware for enforcing access controls
  - [ ] add middleware for dispatching to route handlers
- [ ] `app.routes`
  - [ ] type is `{ [filter: string]: (req: express.Request, res: express.Response) => undefined | Promise<undefined> }`
  - [ ] is a proxy over a plain old object
  - [ ] setters convert to call to `app.refine.routes`
- [ ] `app.access`
  - [ ] type is `{ [filter: string]: (req: express.Request) => ALLOW | DENY | Promise<ALLOW | DENY> }`
  - [ ] is a proxy over a plain old object
  - [ ] setters convert to call to `app.refine.access`
- [ ] `app.refine`
  - [ ] type is `{ routes(value: typeof app.routes): void; access(value: typeof app.access): void; }`
  - [ ] place to check/enforce all refinement rules (TODO: list the rules)
  - [ ] 




## Routist BA decisions 14/10/17
- [ ] Multi-phase development of functionality:
  - phase I:
    - export only express middleware and helpers
  - phase II:
    - reuse phase I functionality
    - support transport-independent message-passing
    - add more transports eg sockets
- [ ] PHASE I:
  - [ ] discriminant uses EXPR/STMT 'dichotomy' for HTTP methods (GET = EXPR, other = STMT)
  - [ ] export `Router` express middleware factory
    - what it does...
    - example...
      ```ts
      let router = routist.expressMiddleware.createRouter();
      app.use(router);
      router['EXPR /users/**'] = async (req, res) => {...}
      routes['STMT /users/**'];

      routes['/users/{usn}'];
      routes['/users!'];
      routes['/users/{usn}/delete!'];
      ```


## Routist BA decisions 5/10/17
- [ ] lib exports several typed classlike objects which provide factory functions
  - [ ] `HttpServer.create` returns an HTTP server instance
    - [ ] listens on a port and responds to HTTP requests
  - [ ] `MessageServer.fromRouteTable` returns message handler/responder/processor/switchboard/exchange/match/message server/coordinator
    - [ ] authentication is indirectly supported (client must provide logic)
    - [ ] authorisation is supported
    - [ ] dispatch/evaluation is supported
  - [ ] `OrgChart.fromGraph` returns ACL/user classifier/anonymiser
    - [ ] supports getting all roles for a given user
    - [ ] supports getting all implied roles for a given role
- [ ] An HTTP Server wraps a generic Message Server


## Routist BA decisions 20/9/17
- [ ] Public API
  - [ ] factory function to create an HTTP Server
  - [ ] HttpServer options
    - [ ] callback to create response for request (encapsulates authentication + authorisation + evaluation)
    - [ ] HTTP specific stuff: `port`
    - [ ] all with defaults
  - [ ] handler helpers
  - [ ] decorators
- [ ] Message type
  - [ ] encoding + decoding messages from/to express req/res
- [ ] creating the req->res callback
  - [ ] decorated class
  - [ ] prop decorators for authorisation (allow, deny, roles)
  - [ ] need to pass in user/role info somewhere
    - [ ] eg provide `getAllRolesFor(userOrRole)` callback in HttpServer options
      - [ ] helper function to make this func from a user/role hash
  - [ ] handler helpers for authentication (login/logout)
- [ ] DEMO
  - [ ] should be mostly decorated class plus user/role mappings


```typescript
export interface OrgChart {
  getUserRoles(user: string): string[] | Promise<string[]>;
  getImpliedRoles?(role: string): string[] | Promise<string[]>;
}
export var OrgChart: {
  fromGraph(graph: ???): OrgChart;
};

export interface MessageServer {
  authorise(msg: Message, orgchart: OrgChart): boolean | Promise<boolean>;
  dispatch(msg: Message): Reply | Promise<Reply>;
}
export var MessageServer: {
  create(): MessageServer;
};

export interface HttpServer {
  start(): Promise<void>;
  stop(): Promise<void>;
  // TODO: ability to update message server and/or orgchart
  // TODO: ability to inspect message server and/or orgchart
}
export var HttpServer: {
  create(options?: HttpServerOptions): HttpServer;
};

export interface HttpServerOptions {
  port?: number;
  messageServer?: MessageServer;
  orgchart?: OrgChart;
}

export interface Message {
  // TODO: ...
}

export interface Reply ??extends Message?? {
  // TODO: ...
}
```





## Routist MVP - minimal demo
- [ ] basic HTTP receiver
  - [x] basic HTTP receiver
  - [ ] change API from class to factory function ie `makeHTTPReceiver`
- [ ] basic authenticator
- [ ] basic authoriser
  - [x] change typedef to `type Authoriser = (msg: Message, user: User) => boolean | Promise<boolean>;`
  - [ ] load object literal (JSON) config - users, roles, policies
    - [x] load it
    - [ ] minimal validation
  - [x] helper fn: given a user, get transitive closure of roles
  - [x] helper fn: make predicate for role list and headline
  - [x] helper fn: make discriminant for role list and headline
  - [x] generate multimethod
  - [ ] add some unit tests 
- [ ] basic dispatcher
  - [ ] way to pass/throw an error into the dispatcher
    - [ ] option 1: modify the Dispatcher signature to accept some Error type
    - [ ] option 2: add a new kind of Message, eg ErrorMessage, with some well-known codes eg unauthorised





## Maintaining an up-to-date Roles Hierarchy
- [ ] Information consisting of:
  - [ ] list of 'relation' tuple mappings, each being [user|role, role] => 'in'|undefined
  - [ ] list of 'policy' tuple mappings, each being [Array<user|role>, headline] => 'allow'|'deny'|...|undefined
  - [ ] `undefined` above is like a tombstone; it indicates the relation or rule has been deleted/removed
- [ ] roles may added or removed
- [ ] relations may be added or removed
- [ ] policies may be added or removed
- [ ] changes will not be frequent (assumption; may not be true for some clients)
- [ ] authoriser may not want to keep entire hierarchy state on hand
  - [ ] need to know when cached state is invalidated
  - [ ] need to know facts about a specific user or role on demand

- [ ] SOLN1: use append-only log / log-structured storage abstraction, plus sequence numbers
  - [ ] how it works?
  - [ ] client generates (batches of) log entries:
    - [ ] of entire current state (may contain redundant entries if not compacted)
    - [ ] whenever any relation or policy changes
  - [ ] routist can access this log:
    - [ ] ???... asks client for all log entries from `seqno` onward
  - [ ] compaction is possible...
  - [ ] client supplies `seed` data object, and `feed` EventEmitter

- [ ] SOLN2: use an etag-like mechanism, but with client and server reversed
  - [ ] etags are opaque to the server. They may be a timestamp, content hash, revision number, etc.
  - [ ] server requests info about a role
  - [ ] client responds with info and an etag
  - [ ] server caches info against the etag
  - [ ] later, server requests info about a role again, sending its etag
  - [ ] if client finds etag hasn't changed, it sends an UNCHANGED reply, otherwise it sends the requested info


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
