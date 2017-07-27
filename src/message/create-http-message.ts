import {Request, Response} from 'express';
import {UserTag} from '../access-control';
import Message from './message';
import MessageType from './message-type';





export default function createHttpMessage(req: Request, res: Response) {
    let message = {type: MessageType.http, request: req, response: res} as Message;
    const userPropKey: keyof Message = 'user';
    Object.defineProperty(message, userPropKey, {
        get: () => {
            // Get the user tag from the session, if any.
            if (!message.request.session) throw new Error(`Internal error: no session!`);
            let user = message.request.session.userTag || null;
            return user;
        },
        set: (value: UserTag|null) => {
            // Set (or clear) the user tag in the session.
            if (!message.request.session) throw new Error(`Internal error: no session!`);
            message.request.session.userTag = value;
        },
    });
    return message;
}
