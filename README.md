# routist

## To Do List

- [x] change pathname to address throughout
- [ ] introduce 'Rule' interface wherever pattern/handler pairs occur
- [ ] asyncify Handler#execute
- [ ] still need `isPromise`? If not, remove it :( Otherwise find a use for it.
- [ ] add Route interface. Make one per rule


## Handler execution order (when multiple handlers for same pattern)
### multiple non-decorators
- method is left up to decorators to resolve
- default is to throw 'ambiguous' error

### multiple mixed decorators/non-decorators
- non-decorators are handled as if they were specialisations of the decorators

### multiple decorators
- assume any order is ok (NOT SAFE! but maybe provide option so it doesn't throw / is allowed)
- implicit ordering
  - but how?
  - order of being added to router? not reliable when multiple sources...
- explicit ordering
  - but how?
  - optional 'ordinal' comment on the end of pattern? like css z-index
  - action name or parameter that somehow indicates priority?


### Options
- allowAmbiguousDecoratorOrder: true|false




## Glossary

**Address:** A string designating the specific resource being requested. Part of a Request.

**Rule:** A condition and action in the form of a Pattern/Handler pair.

**Pattern:** A concise regex-like representation that matches a particular set of Addresses.

**Handler:** TODO... A procedure for generating the Response for a particular Request.... capture names as params... $req, $next...

**Decorator:** A special Rule... TODO

**Priority:** TODO...

**Route:** TODO: ??? An ordered list of Rules that all match an Address.

**Request:** A logical representation... TODO

**Response:** A logical representation... TODO

**Transport:** TODO... listens; maps btw physical<-->logical rq/rs representations

**Router:** TODO... Disptcher. Computes the Route(s?) to a given Address. Needs a set of Rules.
