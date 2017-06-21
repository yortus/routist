import Handler from '../handler';
import meta from './meta';





export default function appData<T>(getData: (session: any, captures: any) => T | Promise<T>, componentName?: string): Handler {
    return meta(async (req, res, captures, next) => {
        let downstreamResult = await next(req, res);
        if (downstreamResult !== false) return downstreamResult;

        let data = await getData((<any>req).session, captures);
        if (componentName) res.setHeader('X-Model-Type', componentName);
        res.send(data);
    });
}
