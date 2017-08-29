import {GUEST, Server, User} from './core';
import {HttpReceiver, isHttpMessage} from './extensions';





// let receiver = new HttpReceiver();
// receiver.start(msg => {
//     console.log(`INCOMING: ${msg.protocol} ${msg.headline}`);
// });
// setTimeout(() => receiver.stop(true).catch(console.log), 5000);





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
        if (!isHttpMessage(msg)) return GUEST;

        //TODO: temp testing...
        let user = msg.request.query.u as User;
        return user || GUEST;
    },

//     authoriser: new RoleBasedAuthenticator({
//         getImpliedRoles: (role: Role) => Role[] | Promise<Role[]>,
//         table: Array<{roles: Rle[], headline: string, policy: ???}>,
//     }),

    dispatcher: msg => {
        if (!isHttpMessage(msg)) return;
        msg.response.sendStatus(404);
    },
});
server.start().catch(console.log);
//setTimeout(() => server.stop().catch(console.log), 5000);





// let server2 = new SimpleHttpServer({
//     port,           // default: 8080?
//     sessions,       // default: 10min sessions, stored in ${cwd}/sessions
//     loginPathname: '/accounts/login', // default: '/login'
//     logoutPathname: '/accounts/logout', // default: '/logout'
//     getImpliedRoles | allRoles,
//     routeTable: RouteTable,
// });
