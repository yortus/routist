




export interface Message {
    executor: User;
    receiver: Receiver;
    selector: Selector;
    arguments: {[name: string]: {}};
    payload?: Payload;
}

export type User = string;

export type Receiver = string;

export type Selector = string;

export type Payload = JsonPayload;

export interface JsonPayload {
    type: 'json';
    value: {};
}





// general utils...
export interface Constructor<T> { new(...args: any[]): T; }
