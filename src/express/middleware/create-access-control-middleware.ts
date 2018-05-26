import {RequestHandler} from 'express';
import * as httperr from 'httperr';
import * as multimethods from 'multimethods';
import {AccessTable} from '../../access-control-types';
import {GUEST} from '../../identity-types';
import Request from '../../request';
import debug from '../../util/debug';
import createMiddleware from './create-middleware';





export default function createAccessControlMiddleware() {

    // TODO: ...
    let accessTable = {} as AccessTable;
    let multimethod = compileAccessTable(accessTable);
    let multimethodUpdatePending = false;

    function updateMultimethod() {
        if (multimethodUpdatePending === true) return;
        multimethodUpdatePending = true;
        process.nextTick(() => {
            multimethod = compileAccessTable(accessTable);
            multimethodUpdatePending = false;
        });
    }

    let accessTableProxy = new Proxy(accessTable, {
        set: (_, key, value) => {
            // TODO: detect collisions... warn/error, provide intentional override system...
            debug(`SET ACCESS FOR: ${key}`); // TODO: temp testing...
            accessTable[key] = value; // TODO: make immutable...
            updateMultimethod();
            return true;
        },
    });


    // TODO: Express middleware function...
    let middleware = createMiddleware(async req => {
        let permission: 'grant' | 'deny';
        try {
            permission = await multimethod(req);
        }
        catch {
            permission = 'deny'; // TODO: doc this... it's the fallback if no catchall or a perm rule throws
            // TODO: if something in permission system throws, we better log the error too...
        }
        if (permission === 'grant') return false;

        // TODO: Permission denied... improve error handling...
        // TODO: use httperr library?
        // TODO: throw error instead of using next...
        let user = req.user === GUEST ? 'GUEST' : req.user;
        throw new httperr[403](`Not permitted:   user="${user}"   intent="${req.intent}"`);
    });

    // TODO: combine...
    let result = middleware as RequestHandler & { access: AccessTable };
    result.access = accessTableProxy;
    return result;
}





function compileAccessTable(access: AccessTable) {

    // TODO: wrap every handler to set req._captures and handle FALLBACK returns
    const methods = Object.keys(access).reduce(
        (meths, key) => {
            meths[key] = async (req, captures) => {
                req._captures = captures;
                let result = await access[key](req);
                return result === 'pass' ? multimethods.CONTINUE : result;
            };
            return meths;
        },
        {} as {[x: string]: (req: Request, captures: any) => Promise<'grant' | 'deny'>}
    );

    // TODO: temp testing...
    return multimethods.create<Request, 'grant' | 'deny'>({
        arity: 1,
        async: undefined,
        methods,
        toDiscriminant: req => req.intent,
    });
}
