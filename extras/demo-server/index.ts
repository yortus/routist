// import './demo-server';
// import {allow, deny, MessagePredicate} from './vnext/access-control';
// import {User} from './vnext/core-types';
// import {error, json, makeMessageServer, MessageHandler} from './vnext/dispatch';
import * as app from './vnext/express-application';
import {allow, ALWAYS, createRouteTable, NEVER, updateSession} from './vnext/express-middleware';





// ================================================================================
// Application State
// ================================================================================
const CEO = 'bob';
let users = ['amy', 'bob', 'cal', 'dan'];
// let managers = {} as {[user: string]: User};

// ceo = 'bob';
// managers = {
//     amy: 'bob',
//     bob: '',
//     cal: 'bob',
//     dan: 'bob',
// };





// ================================================================================
// Demo Code
// ================================================================================
let routes = createRouteTable();
let {queries, actions} = routes;
app.use(routes);
app.start();


// // Get users
// queries['/users/**'] = async (_, res) => res.send({users: ['bob', 'joe']});

// // Update users
// actions['new: /users'] = async (_, res) => res.sendStatus(500);
// actions['delete: /users/{userId}'] = async (_, res) => res.sendStatus(501);
// actions['*: /users/**'] = async (_, res) => res.sendStatus(502);





// Lock down all routes by default. These are redundant since this is the default behaviour anyway.
queries['**'] = allow(NEVER);
actions['**'] = allow(NEVER);

// Session maintenance (login/logout)
actions['/session'] = [
    allow(ALWAYS),
    updateSession({username: 'usn', password: 'pwd'}),
];
queries['/session'] = [
    allow(ALWAYS),
    updateSession({username: 'usn', password: 'pwd'}),
    async (req, res) => {
        res.send({username: req.session!.user});
    },
];

// List all users (only for ceo)
queries['/users'] = [
    allow(user => user === CEO),
    async (_, res) => res.send({users}),
];

// // Show details of given user (only if self or subordinate to logged in user)
// queries['/users/{name}'] = [
//     //allow.ifAny(isSelf({username: 'name'}), isSubordinate({username: 'name'})),
//     json(msg => ({user: msg.arguments.name || 'GUEST', boss: managers[msg.arguments.name as string]})),
// ];

// // List users assigned to given boss (only for managers; boss must be subordinate to logged in user)
// queries['/teams/{boss}'] = [
//     //allow.ifAll(userIsInRole('managers'), isSubordinate({username: 'boss'})),
//     json((_, {boss}) => Object.keys(managers).filter(u => managers[u] === boss)),
// ];

// // Show details of logged in user (not allowed for GUEST)
// queries['/my/self'] = error('Not Implemented');

// // List users assigned to logged in user (only for managers)
// queries['/my/team'] = error('Not Implemented');

// // Create a new user and assign to logged in user (only for managers; user must not already exist)
// actions['create: /users'] = error('Not Implemented');

// // Delete the given user (only for managers; user must be subordinate to logged in user)
// actions['delete: /users'] = error('Not Implemented');

// // Re-assign the given user to the given boss (only for managers; user must be subordinate to logged in user)
// actions['assignto: /users/{name}'] = error('Not Implemented');

// TODO: temp testing...
queries['/favicon.ico'] = [
    allow(ALWAYS),
    async _ => 0,
];





// declare function userIsInRole(roleName: string): MessagePredicate;
// declare function isSelf(paramsNames: {username: string}): MessagePredicate;
// declare function isSubordinate(paramsNames: {username: string}): MessagePredicate;
