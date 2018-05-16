// TODO: submit this to DefinitelyTyped
declare module 'connect-loki' {
    import * as expressSession from 'express-session';

    namespace module {

        export interface Options {
            path?: string;
            autosave?: boolean;
            ttl?: number;
            logErrors?: boolean | Function;
        }

        export class LokiStore extends expressSession.Store {
            constructor(options: Options);
        }
    }
    function module(session: typeof expressSession): typeof module.LokiStore;

    export = module;
}
