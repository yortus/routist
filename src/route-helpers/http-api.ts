import * as url from 'url';
import {Handler} from '../router';





export default function httpApi<S extends ApiFactory<I>, I extends {[K in keyof I]: Function}>(Ctor: S): Handler {
    return async (req, res, captures) => {

        if (!req.session) throw new Error(`rpc internal error: no session!`); // TODO: revise error handling
        let api = new Ctor(req.session, captures);

        if (!api || typeof api !== 'object') throw new Error(`rpc: invalid API object`); // TODO: revise error handling

        let pathname = '/' + url.parse(req.url).pathname;
        let funcName = pathname.substr(pathname.lastIndexOf('/') + 1) as keyof I;
        let func = api[funcName];
        if (typeof func !== 'function') {
            throw new Error(`rpc: invalid API has no function '${funcName}'`); // TODO: revise error handling
        }

        let args = req.body as any[];
        let result = await func.apply(api, args); // NB: handles both sync and async functions
        res.send(result);
        return;
    };
}





export interface ApiFactory<T> {
    new(session: object, captures?: {[name: string]: string}): T;
}
