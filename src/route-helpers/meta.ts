import {Request, Response} from 'express';
import {meta as mmMeta} from 'multimethods';
import {Handler, HandlerResult} from '../router';





export default function meta(handler: MetaHandler): Handler {
    return mmMeta(handler) as Handler;
}





export type MetaHandler = (req: Request, res: Response, captures: Captures, next: Next) => HandlerResult;
export interface Captures { [name: string]: string; }
export type Next = (req: Request, res: Response) => HandlerResult;
