import {Handler} from '../router';
import meta from './meta';





export default function appData<T>(getData: (session: any, captures: any) => T | Promise<T>,
                                   componentName?: string): Handler {
    return meta(async (msg, captures, next) => {
        let downstreamResult = await next(msg);
        if (downstreamResult !== false) return downstreamResult;

        let data = await getData(msg.request.session, captures); // NB: handles both sync and async result
        if (componentName) msg.response.setHeader('X-Model-Type', componentName);
        msg.response.send(data);
    });
}
