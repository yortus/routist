import * as express from 'express';





export namespace Routist {

    export interface RoutistExpressApplication extends express.Application {
        routes: { [filter: string]: Handler };
        access: { [filter: string]: AccessGuard };
        refine: {
            routes(value: RoutistExpressApplication['routes']): void;
            access(value: RoutistExpressApplication['access']): void;
        };
    }

    export function createExpressApplication(): RoutistExpressApplication;

    export interface AccessGuard {
        (req: Request): ALLOW | DENY | Promise<ALLOW | DENY>;
    }

    export type ALLOW = { __allowBrand: any; }

    export type DENY = { __denyBrand: any; }
    
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

    // TODO: temp testing...
    export function compute(cb: (req: Request) => {} | Promise<{}>): Handler;
        




    export namespace AccessControlAPI {

        export let allow: AllowChain;

        interface AllowChain {
            when: Condition;
            always: ChainEnd;
            never: ChainEnd;
        }

        interface Condition {
            (accessPredicate: AccessPredicate): Conjunction & ChainEnd;
            generallyAllowed: Conjunction & ChainEnd;
        }

        interface Conjunction {
            and: Condition;
            or: Condition;
        }

        type ChainEnd = AccessGuard;

        type AccessPredicate = (req: Request) => boolean | Promise<boolean>;
    }
}
