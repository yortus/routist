import {Message} from '../../core';
import HttpMessage from './http-message';





export default function isHttpMessage(msg: Message): msg is HttpMessage {
    return msg.protocol === 'http';
}
