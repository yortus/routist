// import './demo-server';
import {allow, deny, MessagePredicate} from './vnext/access-control';
import {User} from './vnext/core-types';
import {error, json, makeMessageServer, MessageHandler} from './vnext/dispatch';
import {HttpServer} from './vnext/http-server';





// ================================================================================
// Application State
// ================================================================================
let ceo: User;
let users = [] as User[];
let managers = {} as {[user: string]: User};

ceo = 'bob';
users = ['amy', 'bob', 'cal', 'dan'];
managers = {
    amy: 'bob',
    bob: '',
    cal: 'bob',
    dan: 'bob',
};





// ================================================================================
// Dispatch Table
// ================================================================================
const myApp = makeMessageServer({

    // Lock down all routes by default
    '**': deny.always,

    // Session maintenance (login/logout)
    '/session:post': [
        allow.always,
        updateSession({username: 'username', password: 'password'}),
    ],

    // List all users (only for ceo)
    '/users': [
        allow.if(userIsInRole('ceo')),
        json(_ => users),
    ],

    // Show details of given user (only if self or subordinate to logged in user)
    '/users/{name}': [
        allow.ifAny(isSelf({username: 'name'}), isSubordinate({username: 'name'})),
        json(msg => ({user: msg.arguments.name || 'GUEST', boss: managers[msg.arguments.name as string]})),
    ],

    // List users assigned to given boss (only for managers; boss must be subordinate to logged in user)
    '/teams/{boss}': [
        allow.ifAll(userIsInRole('managers'), isSubordinate({username: 'boss'})),
        json((_, {boss}) => Object.keys(managers).filter(u => managers[u] === boss)),
    ],

    // Show details of logged in user (not allowed for GUEST)
    '/my/self': error('Not Implemented'),

    // List users assigned to logged in user (only for managers)
    '/my/team': error('Not Implemented'),

    // Create a new user and assign to logged in user (only for managers; user must not already exist)
    '/users:create': error('Not Implemented'),

    // Delete the given user (only for managers; user must be subordinate to logged in user)
    '/users:delete': error('Not Implemented'),

    // Re-assign the given user to the given boss (only for managers; user must be subordinate to logged in user)
    '/users/{name}:assignto': error('Not Implemented'),

    // TODO: temp testing...
    '/favicon.ico': json(_ => 0),
});





declare function updateSession(...args: any[]): MessageHandler;
declare function userIsInRole(roleName: string): MessagePredicate;
declare function isSelf(paramsNames: {username: string}): MessagePredicate;
declare function isSubordinate(paramsNames: {username: string}): MessagePredicate;





// ================================================================================
// Demo Code
// ================================================================================
let httpServer = new HttpServer({
    dispatchTable: myApp,
});
httpServer.start()
.catch(console.log);





// tslint:disable-next-line:max-classes-per-file
export class Thing {
    [methodName: string]: (msg: string) => any;
}


// tslint:disable-next-line:max-classes-per-file
export class Test2 extends Thing {

    '/users/**'(msg) {
        return msg;
    }
}


export let o: ThisType<string> = {

    get '/users/**'() { return 42; },

    set '/users/**'(_) { ; },
};
