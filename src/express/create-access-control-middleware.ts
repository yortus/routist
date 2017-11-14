// import {Request, RequestHandler} from 'express';
// import * as multimethods from 'multimethods';
// import {GUEST} from '../authentication';
// import {AccessGuard, AccessTable, Permission} from '../authorisation';
// import debug from '../util/debug';





// export default function createAccessControlMiddleware(): RequestHandler & { access: AccessTable } {

//     // TODO: ACL hash...
//     let accessTable = {} as AccessTable;

//     let accessTableProxy = new Proxy(accessTable, {
//         set: (_, key, value) => {
//             debug(`SET ACCESS FOR: ${key}`); // TODO: temp testing...
//             accessTable[key] = value; // TODO: make immutable...

//             // TODO: batch updates... too costly to recompile on every key change
//             mm = compileAccessControls(accessTable);
//             return true;
//         },
//     });

//     // TODO: MM...
//     let mm = compileAccessControls(accessTable);

//     // TODO: Express middleware function...
//     let middleware: RequestHandler = async (req, res, next) => {
//         let permission: Permission.GRANTED | Permission.DENIED;
//         try {
//             permission = await mm(req);
//         }
//         catch {
//             permission = Permission.DENIED; // TODO: doc this... it's the fallback if no catchall or a perm rule throws
//             // TODO: if something in permission system throws, we better log the error too...
//         }
//         if (permission === Permission.GRANTED) {

//             // TODO: permission granted...
//             return next();
//         }

//         // TODO: Permission denied... improve error handling...
//         res.status(403);
//         res.send(`Not permitted:   user="${req.user === GUEST ? 'GUEST' : req.user}"   intent="${req.intent}"`);
//     };

//     // TODO: combine...
//     let result = middleware as RequestHandler & { access: AccessTable };
//     result.access = accessTableProxy;
//     return result;
// }





// function compileAccessControls(access: { [filter: string]: AccessGuard }) {

//     // TODO: wrap every handler to set req._captures and handle FALLBACK returns
//     const methods = Object.keys(access).reduce(
//         (meths, key) => {
//             meths[key] = async (req, captures) => {
//                 req._captures = captures;
//                 let result = await access[key](req);
//                 return result === Permission.INHERITED ? multimethods.CONTINUE : result;
//             };
//             return meths;
//         },
//         {} as {[x: string]: (req: Request, captures: any) => Promise<Permission.GRANTED | Permission.DENIED>}
//     );

//     // TODO: temp testing...
//     return multimethods.create<Request, Permission.GRANTED | Permission.DENIED>({
//         arity: 1,
//         async: undefined,
//         methods,
//         toDiscriminant: req => req.intent,
//     });
// }
