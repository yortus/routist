# routist

## Objectives
- Facilitate creating HTTP Servers
  - provide very simple setup for common cases
  - provide flexible low-level components for special cases
- Client code (eg handlers) are not HTTP-specific, so can be reused eg in APIs
  - allows for future extensions to other messaging systems, eg sockets, pubsub, etc
- Provide flexible authentication/authorisation system
  - authorisation is out-of-the-box
  - authentication requires some user code, eg checking usn/pwd combo against DB
- Provide flexible dispatch system

## Core Concepts
- `HttpServer`: top-level export; makes it easy to create HTTP servers
  - provide a factory function not a class
  - must pass auth/eval details to ctor
- `User`: opaque to routist code but passed through/sessionised; implemented by user code (simple strings?)
  - `HttpServer` can store `User` in HTTP session to associate user with a remote endpoint over time
- `request` and `response` values, both of type `Message`
- `Message`:
    ```
    interface Message {
        from: User          // expend in future
        to: User            // expand in future, eg groups
        subject: string     // indicates resource + intent (verb)
                            // better name? topic, headline, title, directive, summary, command...
        content: Payload    // better name? payload, body
        timestamp: Date     // added automatically
    }
    ```
- sentinel/special messages, eg 'unauthorised' response
- `Payload` type for message content
  - has a `type` prop enum defined and supported by routist
  - all other props are `type`-specific


- authenticate/authorise/evaluate
  - non-http-specific, therefore app-level controls must be in headline/payload envelope, not in eg http headers/status
  - need a number of sentinels so HTTP responses can use proper status codes. Which codes?
    - 200 OK
    - 400 bad request / client error
    - 401 unauthorised
    - 403 forbidden
    - 404 not found
    - 500 server error
  - support other common things in payloads, eg:
    - resource ID (ie the URL pathname)
    - optional params (ie the querystring)
    - username/password (for login route)
    - direct content with MIME type
    - JSON data
    - file upload/download
    - errors
    - paged data (both request and response)
  - *not* distinct steps/phases from routist perspective
    - all included in a single callback/option to `HttpServer`
    - most likely supplied by user as a decorated class (instance)
      - class props + values become `evaluate` multimethod predicates + handlers
      - `authorise` details given as property decorators
      - `authenticate` done through handlers (eg meta handlers)
