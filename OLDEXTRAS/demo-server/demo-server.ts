import {Server, User} from 'routist';
import {HttpReceiver, isHttpMessage, makeRoleAuthoriser} from 'routist';





enum Role {
    ANY = '*',
    guest = 'guest',
    staff = 'staff',
    admin = 'admin',
    it = 'it',
    hr = 'hr',
    manager = 'manager',
    itManager = 'it-manager',
    workshop = 'workshop',
    kwi = 'kwi',
}

enum Policy {
    allow = 'allow',
    deny = 'deny',
}

// tslint:disable:object-literal-key-quotes
let authoriser = makeRoleAuthoriser({
    users: {
        '*': Role.guest,
        bob: Role.itManager,
        joe: Role.it,
        mary: Role.hr,
    },
    roles: {
        [Role.guest]: {},
        [Role.staff]: {
            [Role.admin]: {
                [Role.it]: {
                    [Role.itManager]: {},
                },
                [Role.hr]: {},
                [Role.manager]: {
                    [Role.itManager]: {
                        // TODO: add support for JSON refs/pointers... disabled for now...
                        // $ref: '#/roles/staff/admin/it/it-manager',
                    },
                },
            },
            [Role.workshop]: {
                [Role.kwi]: {},
            },
        },
    },
    policies: [
        [Role.ANY,          '**',                   Policy.deny],
        [Role.it,           'GET /employees/**',    Policy.allow],
        [Role.itManager,    'GET /**',              Policy.allow],
        [Role.itManager,    'GET /employees/**',    Policy.allow],
    ],
});





// TODO temp testing...
let server = new Server({

    receiver: new HttpReceiver({
        port: 8080,
        session: {
            dir: 'sessions',
            timeout: 600, // 10 minutes
        },
    }),

    authenticator: msg => {
        if (!isHttpMessage(msg)) return null;

        // TODO: temp testing...
        let user = msg.request.query.u as User;
        return user || null;
    },

    authoriser,

    dispatcher: msg => {
        if (!isHttpMessage(msg)) return;
        msg.response.sendStatus(404);
    },
});
server.start().catch(console.log);
// setTimeout(() => server.stop().catch(console.log), 5000);
