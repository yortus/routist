import * as express from 'express';





// TODO: ...
export default interface Request extends express.Request {
    user: string | null;
    intent: string;
    fields: { [name: string]: {} };

    // TODO: better way to make this internal?
    _captures: {[captureName: string]: string};
}
