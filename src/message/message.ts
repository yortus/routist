import {Request, Response} from 'express';
import MessageType from './message-type';





// TODO: doc... future expansion: make this a discriminated union
// TODO: doc... all Messages must at least have a `type` and a `discriminant`
type Message = HttpMessage;
export default Message;





// TODO: doc...
export interface HttpMessage extends MessageBase<MessageType.http> {
    request: Request;
    response: Response;
}





// TODO: doc...
export interface MessageBase<T extends MessageType> {
    type: T;
    discriminant: string;
    roles: string[];
}
