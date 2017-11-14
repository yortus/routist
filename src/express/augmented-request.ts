import {Request} from 'express';
import {User} from '../authentication';





export default interface AugmentedRequest extends Request {
    user: User;
    intent: string;
    fields: { [name: string]: {} };
    _captures: {[captureName: string]: string};
}
