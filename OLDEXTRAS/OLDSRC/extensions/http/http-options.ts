




// TODO: doc...
export default interface HttpOptions {
    port?: number;          // default=8080
    session?: {
        dir?: string;       // either absolute, or relative to cwd; default=%CWD%/sessions
        timeout?: number;    // in seconds; default=600 (10 minutes)
    };
}
