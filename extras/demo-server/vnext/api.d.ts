import * as express from 'express';





export namespace Routist {

    export function createDispatchTable(): DispatchTable & express.RequestHandler;

    // TODO: routist must be able to differentiate access guards from handlers at runtime, to wrap them differently.
    //       TypeScript can already differentiate them using their return types (or a brand can be added if needed).
    //       For runtime differentiation, suggest adding a private symbol or using a weakmap to identify access guards.
    export interface DispatchTable {
        queries: { [pattern: string]: AccessGuard | Handler | Array<AccessGuard | Handler> };
        actions: { [pattern: string]: AccessGuard | Handler | Array<AccessGuard | Handler> };
    }

    export interface AccessGuard {
        (req: Request): ALLOW | DENY | Promise<ALLOW | DENY>;

        // TODO: need this brand so that only the access control API can generate access guards.
        __accessGuardBrand: any;
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





    export namespace AccessControlAPI {

        export let allow: AllowChain;

        interface AllowChain {
            when: Condition;
            always: ChainEnd;
            never: ChainEnd;
        }

        interface Condition {
            (accessPredicate: AccessPredicate): Conjunction & ChainEnd;
            previouslyAllowed: Conjunction & ChainEnd;
        }

        interface Conjunction {
            and: Condition;
            or: Condition;
        }

        type ChainEnd = AccessGuard;

        type AccessPredicate = (req: Request) => boolean | Promise<boolean>;
    }
}
