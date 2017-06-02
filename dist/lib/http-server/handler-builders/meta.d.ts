/// <reference types="express" />
import * as e from 'express';
import Handler, { HandlerResult } from '../handler';
export default function meta(handler: MetaHandler): Handler;
export declare type MetaHandler = (req: e.Request, res: e.Response, captures: {
    [name: string]: string;
}, next: (req: e.Request, res: e.Response) => HandlerResult) => HandlerResult;
