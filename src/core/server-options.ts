import Authenticator from './authenticator';
import Authoriser from './authoriser';
import Dispatcher from './dispatcher';
import Receiver from './receiver';
import Role from './role';





export default interface ServerOptions {
    receiver: Receiver;
    authenticator: Authenticator;
    authoriser: Authoriser;
    dispatcher: Dispatcher;

    // TODO: more???
    getImpliedRoles(role: Role): Role[] | Promise<Role[]>; // NB: `role` may be a user since User is-a Role
}
