export {HttpMessage, HttpOptions, HttpReceiver, isHttpMessage} from './http';
export {makeRoleAuthoriser, RoleAuthoriserOptions} from './rbac';





// TODO: temp testing...
// import {makeRoleAuthoriser} from './rbac';

// enum Role {
//     ANY = '*',
//     guest = 'guest',
//     staff = 'staff',
//     admin = 'admin',
//     it = 'it',
//     hr = 'hr',
//     manager = 'manager',
//     itManager = 'it-manager',
//     workshop = 'workshop',
//     kwi = 'kwi',
// }

// enum Policy {
//     allow = 'allow',
//     deny = 'deny',
// }

// tslint:disable:object-literal-key-quotes
// let auth = makeRoleAuthoriser({
//     users: {
//         '*': Role.guest,
//         bob: Role.itManager,
//         joe: Role.it,
//         mary: Role.hr,
//     },
//     roles: {
//         [Role.guest]: {},
//         [Role.staff]: {
//             [Role.admin]: {
//                 [Role.it]: {
//                     [Role.itManager]: {},
//                 },
//                 [Role.hr]: {},
//                 [Role.manager]: {
//                     [Role.itManager]: {
//                         // TODO: add support for JSON refs/pointers... disabled for now...
//                         // $ref: '#/roles/staff/admin/it/it-manager',
//                     },
//                 },
//             },
//             [Role.workshop]: {
//                 [Role.kwi]: {},
//             },
//         },
//     },
//     policies: [
//         [Role.ANY,          '**',               Policy.deny],
//         [Role.it,           '/employees/**',    Policy.allow],
//         [Role.itManager,    '/**',              Policy.allow],
//     ],
// });

// auth = auth;





// Message producers
// export interface CompositeReceiver extends Receiver {
//     cr: CompositeReceiver;
// }





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



