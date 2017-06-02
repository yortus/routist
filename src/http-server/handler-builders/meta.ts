import * as e from 'express';
import {meta as mmMeta} from 'multimethods';
import Handler, {HandlerResult} from '../handler';





export default function meta(handler: MetaHandler): Handler {
    return mmMeta(handler) as Handler;
}





export type MetaHandler = (req: e.Request, res: e.Response, captures: {[name: string]: string}, next: (req: e.Request, res: e.Response) => HandlerResult) => HandlerResult;
