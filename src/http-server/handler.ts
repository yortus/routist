import * as e from 'express';
export default Handler;





export type Handler = (req: e.Request, res: e.Response, captures: {[name: string]: string}) => HandlerResult;





export type HandlerResult = false | void | Promise<false | void>;
