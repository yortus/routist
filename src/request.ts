import * as express from 'express';
import GUEST from './guest';





// TODO: ...
export default interface Request extends express.Request {
    user: string | GUEST;
    intent: string;
    fields: { [name: string]: {} };

    // TODO: better way to make this internal?
    _captures: {[captureName: string]: string};
}
