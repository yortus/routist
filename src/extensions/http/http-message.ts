import {Request, Response} from 'express';
import {Message} from '../../core';





// TODO: doc...
export default interface HttpMessage extends Message {
    request: Request;
    response: Response;
}
