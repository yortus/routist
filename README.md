# routist


## is the `∅` pattern ever useful?

- is there such a regex? Yes infinitely many, eg A|!A
- any need to express the pattern that matches no strings? when? why? scenario?
- just remove it and add it back later if needed to express something?
- it's the subtype of all patterns, a.k.a. TypeScript's `never` type





## To Do List

- [ ] revise terminology for pattern-matching/dispatch (basically the RuleSet)
  - RuleSet --> Dispatcher
  - address --> discriminant
  - request --> ??? input $input in $in
  - response --> ??? result? output $output out $out
- [ ] still need `∅` pattern anywhere in /src?
- [ ] update pattern comments/docs
- [ ] update pattern (intersection) unit tests
- [ ] in RuleSet, what's involved in dropping the `address` parameter from handlers? check perf diff too...
- [ ] finalize taxonomy changes w.r.t. Pattern#intersect changes
- [ ] properly introduce RuleSet options, first option is strict/loose checking for all routes handled

- [ ] can bundling be implemented as a decorator? any advantage in doing that?
- [ ] List HTTP handler use cases
      - content (inline/mime and attachment/download)
      - json/data
      - bundles
      - redirect
      - POST/DELETE/PUT etc



- [x] RuleSet: change to UNHANDLED sentinel value instead of null
- [ ] RuleSet: allow UNHANDLED value to be specified as an option
- [ ] RuleSet: allow custom 'tiebreak' function to be specified as an option
- [ ] Transport: for 'file' responses, harden againt rel paths in address eg '../../../sys/passwords.txt'
- [ ] docs: some code comments are almost impossible to grasp (eg see comments in findAllRoutesThroughRuleSet). Need step-by-step explanations of concepts in separate .md file(s), code can refer reader to these docs for more explanation. Code comments should then be reduced to simpler statements.
- [ ] make runnable client-side
  - [ ] isolate/replace rule-set deps: node (assert, util)
  - [ ] isolate transport deps: node (http/s), node-static
- [ ] investigate N-way multiple dispatch
  - [ ] RuleSet becomes Dispatcher and ctor takes params for: ruleSet, arg->addr mapper(s), options
- [x] transpile to /dist or /built directory and npmignore src/
- [x] more pegjs to devDeps and make PEG compilation a build step
- [x] change {...rest} to {**rest} / {…rest} for consistency?
- [x] change ** to ...?
- [x] rename Taxonomy --> TxonomyNode? Need to make clear each instance fundamentally represents a node, and a bunch of them form a graph
- [x] decouple address from Request
- [x] add Pattern#intersect, update all call sites (just make-taxonomy)
- [x] create Taxonomy class and/or add /src/taxonomy/index.ts
- [x] improve taxonomy test coverage
- [x] asyncify Handler#execute
- [x] still need `isPromise`? If not, remove it :( Otherwise find a use for it.
- [x] add npmignore


## pros/cons for custom UNHANDLED value
- CON: builtin handlers don't know which UNHANDLED to use - can't assume the default one will work
- CON: if the default HANDLER always works in addition to a user-defd one, then checking for UNHANDLED value becomes more complicated
- PRO: why? use case? Can decide that undefined means UNHANLDED, or null, or false or falsy.

## The Pattern DSL

A valid pattern string conforms to the following rules:
- Patterns are case-sensitive.
- A pattern consists of an alternating sequence of captures and literals.
- A literal consists of one or more adjacent characters from the set `[A-Za-z0-9 /._-]`.
- Literals must exactly match a corresponding portion of an address.
- A capture represents an operator that matches zero or more characters of an address.
- There are two types of captures: globstars and wildcards.
- A globstar greedily matches zero or more adjacent characters in an address.
- A wildcard greedily matches zero or more adjacent characters in an address, but cannot match `/`.
- Captures may be named or anonymous. Named captures return their correspoding capture values in the result of a call to `Pattern#match`.
- An anonymous globstar is designated with `...` or `…`.
- A named globstar is designated with `{...id}` where id is a valid JS identifier.
- An anonymous wildcard is designated with `*`.
- A named wildcard is designated with `{id}` where id is a valid JS identifier.
- Two captures may not occupy adjacent positions in a pattern.
- Patterns may have trailing whitespace, which is removed.
- Whitespace consists of spaces and/or comments.
- A comment begins with `#` and continues to the end of the string.
- The special pattern `∅` is permitted. It represents a pattern that matches no addresses.

## Pattern DSL Examples

- `'/foo'` matches only the literal address `'/foo'` and nothing else
- `'/foo/*'` matches `'/foo/bar'` and `'/foo/'` but not `'/foo'` or `'/foo/bar/baz'`
- `'/foo...'` (or `'/foo…'`) matches `'/foo'`, `'/foo/bar'` and `'/foo/bar/baz'`
- `'{...path}/{name}.{ext}` matches `'/api/foo/bar.html'` with `{path: '/api/foo', name: 'bar', ext: 'baz' }`
- `'*{...path}'` is invalid (two adjacent captures)
- `'...'` (or `'…'`) matches all addresses
- `'*'` matches all addresses that do not contain `'/'`
- `'∅'` matches no addresses


## Glossary

**Address:** A string designating the specific resource being requested. Part of a Request.

**Rule:** A condition and action in the form of a Pattern/Handler pair.

**Rule Set:** TODO...

**Pattern:** A concise regex-like representation that matches a particular set of Addresses.

**[Pattern] Signature:** TODO...

**Handler:** TODO... A procedure for generating the Response for a particular Request.... capture names as params... $req, $next...

**Decorator:** A special Rule... TODO

**Priority:** TODO...

**Route:** TODO: ??? An ordered list of Rules that all match an Address.

**Request:** A logical representation... TODO

**Response:** A logical representation... TODO

**Transport:** TODO... listens; maps btw physical<-->logical rq/rs representations

**Router:** TODO... Disptcher. Computes the Route(s?) to a given Address. Needs a set of Rules.



```
rule set:
- set of rules (unordered)

rule:
- pair of pattern string and handler function
- captures in pattern string match parameters in handler function
- called the 'raw' pattern and 'raw' handler for distinction from canonical forms

normalization:
- canonical pattern
- canonical handler

handler types:
- partial handler
- general handler (decorator)


```
