## Decisions:
- [ ] Built-in features:
  - [ ] route management
  - [ ] static file handling
  - [ ] session management (with extension points)
  - [ ] permissions system (with extension points)
  - [ ] RPC - clientside and serverside support






## To Do:
- [ ] blah





```ts


class Routes extends HttpServer {

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
Routes.setup({ port: 1337 });
Routes.start();
Routes.stop();



interface Context {
    request: Request;
    response: Response;

    // getter & setter:
    username: string|number|GUEST; // guest, none, logged_out, nobody, anon, unknown, unauthorised, not_set, unset, unchecked



}

// pass, permit, warrant, license, clearance, ticket, badge, seal, stamp, charter, consent, order, passport, visa, voucher, standing, right

// allow/deny, accept/reject, permit/refuse, len/ban, allow/block
```
