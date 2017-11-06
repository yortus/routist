import {Request} from 'express';





export interface AccessGuard {
    (req: Request): GRANT | DENY | Promise<GRANT | DENY>;
}





type GRANT = { __grantBrand: any; }
const GRANT = Symbol('GRANT') as any as GRANT;
type DENY = { __denyBrand: any; }
const DENY = Symbol('DENY') as any as DENY;
export {GRANT, DENY}





export let grant: AccessImperative1 = {
    // TODO: temp testing... support `when` etc
    access: (() => GRANT) as any,
};

export let deny: AccessImperative1 = {
    // TODO: temp testing... support `when` etc
    access: (() => DENY) as any,
};

interface AccessImperative1 {
    access: AccessImperative2 & AccessGuard;
}

interface AccessImperative2 {
    when: Condition;
}

interface Condition {
    (accessPredicate: AccessPredicate): Conjunction & Fallback & AccessGuard;
}

interface Conjunction {
    and: Condition;
    or: Condition;
}

interface Fallback {
    otherwise: {
        fallback: AccessGuard;
    }
}

export type AccessPredicate = (req: Request) => boolean | Promise<boolean>;
