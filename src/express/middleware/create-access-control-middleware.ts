import {RequestHandler} from 'express';
import * as httperr from 'httperr';
import * as multimethods from 'multimethods';
import {AccessTable, Permission} from '../../access-control';
import Request from '../../request';
import {GUEST} from '../../user';
import debug from '../../util/debug';
import createMiddleware from './create-middleware';





export default function createAccessControlMiddleware() {

    // TODO: ACL hash...
    let accessTable = {} as AccessTable;

    let accessTableProxy = new Proxy(accessTable, {
        set: (_, key, value) => {
            debug(`SET ACCESS FOR: ${key}`); // TODO: temp testing...
            accessTable[key] = value; // TODO: make immutable...

            // TODO: batch updates... too costly to recompile on every key change
            // TODO: ---IDEA--- also provide a .refresh() method
            mm = compileAccessTable(accessTable);
            return true;
        },
    });

    // TODO: MM...
    let mm = compileAccessTable(accessTable);

    // TODO: Express middleware function...
    let middleware = createMiddleware(async req => {
        let permission: Permission.GRANTED | Permission.DENIED;
        try {
            permission = await mm(req);
        }
        catch {
            permission = Permission.DENIED; // TODO: doc this... it's the fallback if no catchall or a perm rule throws
            // TODO: if something in permission system throws, we better log the error too...
        }
        if (permission === Permission.GRANTED) return false;

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
                return result === Permission.INHERITED ? multimethods.CONTINUE : result;
            };
            return meths;
        },
        {} as {[x: string]: (req: Request, captures: any) => Promise<Permission.GRANTED | Permission.DENIED>}
    );

    // TODO: temp testing...
    return multimethods.create<Request, Permission.GRANTED | Permission.DENIED>({
        arity: 1,
        async: undefined,
        methods,
        toDiscriminant: req => req.intent,
    });
}
