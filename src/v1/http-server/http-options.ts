import {AccessControlOptions} from '../access-control';





// TODO: doc...
type HttpOptions  = AccessControlOptions & {
    secret?: string;
    port?: number;
    sessionsDir?: string; // NB: must be absolute; default is %CWD%/sessions
};
export default HttpOptions;
