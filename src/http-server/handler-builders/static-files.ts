import * as path from 'path';
import * as url from 'url';
import * as e from 'express';
import * as serveStatic from 'serve-static';
import * as stackTrace from 'stack-trace';
import Handler from '../handler';





// TODO: doc...
export default function staticFiles(rootPath: string): Handler {

    // TODO: doc this... resolve rootPath relative to dir of immediate caller    
    let callerFilename: string = stackTrace.get()[1].getFileName();
    let callerDirname = path.dirname(callerFilename);
    rootPath = path.resolve(callerDirname, rootPath);
    // TODO: ensure path exists...

    let serveStaticOptions = { index: [] }; // NB: Disable having `dirname` resolve to `dirname/index.html`
    let serveStaticHandler = promisifyExpressHandler(serveStatic(rootPath, serveStaticOptions));
    
    return async (req, res, captures: {path: string}) => {
        if (typeof captures.path !== 'string') throw new Error(`static file route expects {...path} capture variable`);
        let oldUrl = req.url;
        let {protocol, auth, host, search, hash} = url.parse(oldUrl);
        let pathname = captures.path;
        req.url = url.format({ protocol, auth, host, pathname, search, hash });
        let handled = await serveStaticHandler(req, res, {});
        req.url = oldUrl;
        return handled;
    };
}





// TODO: helpers... this is a general thing that might be useful elsewhere too...
function promisifyExpressHandler(expressHandler: e.Handler): Handler {
    return (req, res) => {
        return new Promise<false | void>((resolve, reject) => {

            // TODO: ...
            let interceptNext = (err?: any) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(false); // UNHANDLED
                }
            };

            // Listen for response events and resolve/reject acordingly.
            // NB: This relies on Promise behaviour that subsequent calls to resolve/reject are ignored.
            res.once('finish', () => {
                resolve(undefined); // HANDLED
            });
            res.once('close', () => {
                resolve(undefined); // HANDLED
            });
            res.once('error', err => {
                interceptNext(new Error(`event: "error" with ${err}`));
            });

            // Call the original handler
            expressHandler(req, res, interceptNext);
        });
    }
}
