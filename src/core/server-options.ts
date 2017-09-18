import Authenticator from './authenticator';
import Authoriser from './authoriser';
import Dispatcher from './dispatcher';
import Receiver from './receiver';





export default interface ServerOptions {
    receiver: Receiver;
    authenticator: Authenticator;
    authoriser: Authoriser;
    dispatcher: Dispatcher;
}
