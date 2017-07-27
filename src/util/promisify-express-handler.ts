import {Handler as ExpressHandler, Request, Response} from 'express';





// TODO: doc...
export default function promisifyExpressHandler(expressHandler: ExpressHandler): PromisifiedHandler {
    return (req, res) => {
        return new Promise((resolve, reject) => {

            // TODO: ...
            let wrappedNext = (err?: any) => {
                if (err) {
                    reject(err);    // FAILURE
                }
                else {
                    resolve(false); // SKIPPED (i.e. handler indicated it did nothing, and other handlers can be tried)
                }
            };

            // Listen for response events and resolve/reject acordingly.
            // NB: This relies on Promise behaviour that subsequent calls to resolve/reject are ignored.
            res.once('finish', () => {
                resolve(true);      // SUCCESS
            });
            res.once('close', () => {
                resolve(true);      // SUCCESS
            });
            res.once('error', err => {
                wrappedNext(new Error(`event: "error" with ${err}`)); // FAILURE
            });

            // Call the original handler
            expressHandler(req, res, wrappedNext);
        });
    };
}





// TODO: doc... eventual returned value: true=success; false=skipped; reject=failure
export type PromisifiedHandler = (req: Request, res: Response) => Promise<boolean>;
