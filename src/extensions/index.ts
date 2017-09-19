export {HttpMessage, HttpOptions, HttpReceiver, isHttpMessage} from './http';
export {makeRoleAuthoriser, RoleAuthoriserOptions} from './rbac';





// TODO:
// HttpReceiver extends Receiver
// - accepts options: port, session {dir, timeout}
// HttpMessage extends Message
// isHttpMessage user-defined type guard for narrowing

// HttpUserPassAuthenticator
// - must pass options:
//   - way of recognising login headline (regex), and extracting username and password (from req.body)
//   - callback for verifying usn/pwd combo
//   - way of recognising logout headline (regex?)
// - uses sessions if available

// AccessControlList extends Authoriser
// - protocol-agnostic
// - needs `getImpliedRoles` client function as option

// DispatchTable extends Dispatcher
// - protocol-agnostic
// - uses multimethods
// - supports decorators: ...
// - supports handler-builders: ...
