import * as express from 'express';
import User from './user';





// TODO: ...
export default interface Request extends express.Request {
    user: User;
    intent: string;
    fields: { [name: string]: {} };

    // TODO: better way to make this internal?
    _captures: {[captureName: string]: string};
}
