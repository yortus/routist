import Handler from '../handler';
export default function httpApi<S extends {
    new (session: object, captures?: {
        [name: string]: string;
    }): I;
}, I extends {
    [K in keyof I]: Function;
}>(Ctor: S): Handler;
