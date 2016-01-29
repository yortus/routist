# routist

## To Do List

- [ ] change pathname to address throughout
- [ ] introduce 'Rule' interface wherever pattern/handler pairs occur
- [ ] asyncify Handler#execute
- [ ] still need `isPromise`? If not, remove it :( Otherwise find a use for it.
- [ ] add Route interface. Make one per rule


## Glossary

**Address:** A string designating the specific resource being requested. Part of a Request.

**Pattern:** A concise regex-like representation that matches a particular set of Addresses.

**Action:** TODO... raw handler... capture names as params, $req, $yield

**Handler:** A procedure for generating the Response for a particular Request.

**Decorator:** A special Handler... TODO

**Rule:** A Pattern/Handler pair.

**Route:** An ordered list of Rules that match an Address.

**Request:** A logical representation... TODO

**Response:** A logical representation... TODO

**Transport:** TODO... listens; maps btw physical<-->logical rq/rs representations

**Router:** TODO... Disptcher. Computes the Route(s?) to a given Address. Needs a set of Rules.
