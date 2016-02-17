# routist


## To Do List

- [x] add Pattern#intersect, update all call sites (just make-taxonomy)
- [ ] create Taxonomy class and/or add /src/taxonomy/index.ts
- [ ] improve taxonomy test coverage
- [ ] asyncify Handler#execute
- [ ] still need `isPromise`? If not, remove it :( Otherwise find a use for it.
- [ ] add npmignore
- [ ] for 'file' responses, harden againt rel paths in address eg '../../../sys/passwords.txt'


## The Pattern DSL

A valid pattern string conforms to the following rules:
- Patterns are case-sensitive.
- A pattern consists of an alternating sequence of captures and literals.
- A literal consists of one or more adjacent characters from the set `[A-Za-z0-9/._-]`.
- Literals must exactly match a corresponding portion of an address.
- A capture represents an operator that matches zero or more characters of an address.
- There are two types of captures: globstars and wildcards.
- A globstar greedily matches zero or more adjacent characters in an address.
- A wildcard greedily matches zero or more adjacent characters in an address, but cannot match `/`.
- Captures may be named or anonymous. Named captures return their correspoding capture values in the result of a call to `Pattern#match`.
- An anonymous globstar is designated with `**` or `…`.
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
- `'/foo**'` (or `'/foo…'`) matches `'/foo'`, `'/foo/bar'` and `'/foo/bar/baz'`
- `'{...path}/{name}.{ext}` matches `'/api/foo/bar.html'` with `{path: '/api/foo', name: 'bar', ext: 'baz' }`
- `'*{...path}'` is invalid (two adjacent captures)
- `'**'` (or `'…'`) matches all addresses
- `'*'` matches all addresses that do not contain `'/'`
- `'∅'` matches no addresses


## Glossary

**Address:** A string designating the specific resource being requested. Part of a Request.

**Rule:** A condition and action in the form of a Pattern/Handler pair.

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
route table:
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
