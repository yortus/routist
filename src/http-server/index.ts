import { UserTag } from '../access-control';





export { default } from './http-server';
export {default as HttpServerOptions} from './options';





// TODO: temp testing... put this where?
// Augment the Session interface with an optional userTag
// tslint:disable-next-line:no-namespace
declare global {
    namespace Express {
        interface Session {
            userTag: UserTag | null;
        }
    }
}
