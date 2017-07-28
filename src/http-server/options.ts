import {UserOptions} from '../access-control';





// TODO: doc...
export default interface Options extends UserOptions {
    secret?: string;
    port?: number;
    sessionsDir?: string; // NB: must be absolute; default is %CWD%/sessions
}
