import * as express from 'express';





export namespace Routist {
    
    export interface Handler {
        (req: Request, res: Response): void | Promise<void>;
    }

    export interface Request extends express.Request {
        user: string | GUEST;         // Use getter/setter to define this
        fields: {[name: string]: {}}; // Use proxy object to define this; {captures/params -> form/body -> querystring} 
        intent: string;               // Compute as ordinary property (readonly)
    }

    export type GUEST = { __guestBrand: any; }

    export interface Response extends express.Response { }

    export namespace reply {

        export function json(cb: (req: Request) => {} | Promise<{}>): Handler;
        export function json(value: {}): Handler;
        export function error(message: string): Handler;
        // TODO: ...
    }
}
