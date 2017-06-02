/// <reference types="express" />
import * as e from 'express';
export default Handler;
export declare type Handler = (req: e.Request, res: e.Response, captures: {
    [name: string]: string;
}) => HandlerResult;
export declare type HandlerResult = false | void | Promise<false | void>;
