import * as path from 'path';
import * as serveStatic from 'serve-static';
import * as stackTrace from 'stack-trace';
import * as url from 'url';
import {CONTINUE, RouteHandler} from '../route-dispatch-types';
import promisifyExpressHandler from '../util/promisify-express-handler';





// TODO: doc...
export default function staticFiles(rootPath: string): RouteHandler {

    // TODO: doc this... resolve rootPath relative to dir of immediate caller
    let callerFilename = stackTrace.get()[1].getFileName();
    let callerDirname = path.dirname(callerFilename);
    rootPath = path.resolve(callerDirname, rootPath);
    // TODO: ensure path exists... and that it is a dir...

    let serveStaticOptions = { index: [] }; // NB: Disable having `dirname` resolve to `dirname/index.html`
    let serveStaticHandler = promisifyExpressHandler(serveStatic(rootPath, serveStaticOptions));

    return async (req, res) => {
        if (typeof req.fields.path !== 'string') throw new Error(`static file route expects a 'path' field`);
        let oldUrl = req.url;
        let {protocol, auth, host, search, hash} = url.parse(oldUrl);
        let pathname = req.fields.path as string;
        req.url = url.format({ protocol, auth, host, pathname, search, hash });

        // TODO: more graceful behaviour if handler throws? Esp don't leak exception details to response
        let handled = await serveStaticHandler(req, res);
        req.url = oldUrl;
        return handled ? undefined : CONTINUE;
    };
}
