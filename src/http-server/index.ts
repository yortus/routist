export {default} from './http-server';
export {default as HttpOptions} from './http-options';





// TODO: temp testing... put this where?
// Augment the Session interface with an optional `roles` property
// tslint:disable-next-line:no-namespace
declare global {
    namespace Express {
        interface Session {
            roles?: string[];
        }
    }
}
