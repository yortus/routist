




// TODO: doc...
export default interface HttpServerOptions {
    secret?: string;
    port?: number;
    sessionsDir?: string; // NB: must be absolute; default is %CWD%/sessions
}
