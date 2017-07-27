import * as url from 'url';
import {Handler} from '../router';





// TODO: rename to RPC something...





export default function httpApi<S extends ApiFactory<I>, I extends {[K in keyof I]: Function}>(Ctor: S): Handler {
    return async (msg, captures) => {

        if (!msg.request.session) throw new Error(`RPC internal error: no session!`); // TODO: revise error handling
        let api = new Ctor(msg.request.session, captures);

        if (!api || typeof api !== 'object') throw new Error(`RPC: invalid API object`); // TODO: revise error handling

        let pathname = '/' + url.parse(msg.request.url).pathname;
        let funcName = pathname.substr(pathname.lastIndexOf('/') + 1) as keyof I;
        let func = api[funcName];
        if (typeof func !== 'function') {
            throw new Error(`RPC: API has no function '${funcName}'`); // TODO: revise error handling
        }

        let args = msg.request.body as any[];
        let result = await func.apply(api, args); // NB: handles both sync and async functions
        msg.response.send(result);
    };
}





export interface ApiFactory<T> {
    new(session: object, captures?: {[name: string]: string}): T;
}
