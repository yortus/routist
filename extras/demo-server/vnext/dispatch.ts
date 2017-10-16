import {Message, Payload} from './core-types';





export declare function makeMessageServer(dtable: DispatchTable): {};





export interface DispatchTable {
    [messageFilter: string]: MessageHandler | MessageHandler[];
}





export type MessageHandler = (msg: Message, captures: Captures) => Reply | Promise<Reply>;





export interface Captures {
    [name: string]: string;
}





export type Reply = Payload | undefined;





// ================================================================================
// Dispatch Helper Functions and Decorators
// ================================================================================
export function json(impl: (msg: Message, captures: Captures) => {} | Promise<{}>): MessageHandler {
    return async (msg, captures) => ({
        type: 'json',
        value: await impl(msg, captures),
    } as Payload);
}
export function error(errorMessage: string): MessageHandler {
    return () => { throw new Error(errorMessage); };
}
