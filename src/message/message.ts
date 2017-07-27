import {Request, Response} from 'express';
import {UserTag} from '../access-control';
import MessageType from './message-type';





// TODO: doc... future expansion: make this a discriminated union
export default interface Message {
    type: MessageType;
    request: Request;
    response: Response;
    user: UserTag|null;
}
