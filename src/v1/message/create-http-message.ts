import {Request, Response} from 'express';
import * as url from 'url';
import {HttpMessage} from './message';
import MessageType from './message-type';





export default function createHttpMessage(request: Request, response: Response) {
    let discriminant = `${request.method} ${url.parse(request.url).pathname || ''}`;
    let message = {type: MessageType.http, discriminant, request, response} as HttpMessage;

    const rolesPropKey: keyof HttpMessage = 'roles';
    Object.defineProperty(message, rolesPropKey, {
        get: () => {
            // Get the roles from the session, creating an empty array if necessary.
            let session = message.request.session;
            if (!session) throw new Error(`Internal error: no session!`);
            let roles = session.roles || (session.roles = []);
            return roles;
        },
        set: (value: string[]) => {
            // Validate roles
            if (value.some(role => role === '*')) throw new Error(`Wildcard role '*' cannot be used here`);

            // Overwrite the roles in the session.
            if (!message.request.session) throw new Error(`Internal error: no session!`);
            message.request.session.roles = value;
        },
    });

    return message;
}
