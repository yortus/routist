//import {Server} from './core';
import {HttpReceiver} from './extensions';





let receiver = new HttpReceiver();
receiver.start(msg => {
    console.log(`INCOMING: ${msg.protocol} ${msg.headline}`);
});
setTimeout(() => receiver.stop(true).catch(console.log), 5000);





// // TODO temp testing...
// let server = new Server({

//     receiver: new HttpReceiver({
//         port: 8080,
//         sessions: {
//             dir: '/blah',
//             timeout: {mins: 10},
//         }
//     },

//     authenticator: new HttpUserPassAuthenticator({
//         login: {
//             pathname: '/accounts/login',
//             username: 'username',
//             password: 'password',
//             verify: (username: string, password: string): User | Promise<User>,
//         }
//         logout: {
//             pathname: '/accounts/logout',
//         }
//     }),

//     authoriser: new RoleBasedAuthenticator({
//         getImpliedRoles: (role: Role) => Role[] | Promise<Role[]>,
//         table: Array<{roles: Rle[], headline: string, policy: ???}>,
//     }),

//     dispatcher: new RouteTableDispatcher({
//         table: RouteTable
//     }),
// });

// let server2 = new SimpleHttpServer({
//     port,           // default: 8080?
//     sessions,       // default: 10min sessions, stored in ${cwd}/sessions
//     loginPathname: '/accounts/login', // default: '/login'
//     logoutPathname: '/accounts/logout', // default: '/logout'
//     getImpliedRoles | allRoles,
//     routeTable: RouteTable,
// });
