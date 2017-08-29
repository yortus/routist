import {meta as mmMeta} from 'multimethods';
import Message from '../message';
import {Handler, HandlerResult} from '../route-table';





export default function meta(handler: MetaHandler): Handler {
    return mmMeta(handler) as Handler;
}





export type MetaHandler = (msg: Message, captures: Captures, next: Next) => HandlerResult;
export interface Captures { [name: string]: string; }
export type Next = (msg: Message) => HandlerResult;
