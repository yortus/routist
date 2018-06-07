import {RequestHandler} from 'express';
import * as httperr from 'httperr';
import AccessTable from '../../access-table';
import GUEST from '../../guest';
import {ApplicationConfig} from '../application/application-options';
import createMiddleware from './create-middleware';





export default function createAccessControlMiddleware(config: ApplicationConfig) {

    // TODO: ...
    let accessTable = new AccessTable();

    // TODO: Express middleware function...
    let middleware = createMiddleware(async req => {
        let permission: 'grant' | 'deny';
        try {
            permission = await accessTable.query(req.user, req.intent) ? 'grant' : 'deny';
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
    }, config);

    // TODO: combine...
    let result = middleware as RequestHandler & { access: AccessTable };
    result.access = accessTable;
    return result;
}
