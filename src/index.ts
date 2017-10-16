export {GUEST, Server, User} from './core';
export {HttpReceiver, isHttpMessage, makeRoleAuthoriser} from './extensions';





// -------------------- ORG CHART --------------------
export declare function temp(mexpr: {message: Message2, receiver: Receiver, user: UserAcct}): Reply2;
export interface Message2 { selector: string; arguments?: any; }
export type Receiver = string;
export type UserAcct = string;
export type Reply2 = any;
export let t2: typeof temp = ({message, receiver, user}) => ({message, receiver, user});





// -------------------- ORG CHART --------------------
export interface OrgChart {
    getUserRoles(user: string): string[] | Promise<string[]>;
    getImpliedRoles?(role: string): string[] | Promise<string[]>;
}

export const OrgChart = {
    fromLiteral(literal: OrgChartLiteral): OrgChart {
        literal = literal;
        throw new Error('Not Implemented');
    },
};

export interface OrgChartLiteral {

    // Map users to their role or roles
    users: {[user: string]: string|string[]; };

    // Nested object representing top-down role hierarchy DAG
    // TODO: doc... may be a DAG using JSON refs + pointers...
    // TODO: impl JSON refs+pointers, ensure no cycles and that top-level roles have no incoming edges
    roles: {[role: string]: OrgChartLiteral['roles']};
}


// -------------------- MESSAGE / REPLY --------------------
export interface Message {
    // resource + arguments (name/value pairs):
    // for HTTP: resource is the pathname of the URL, params includes method, body, querystring, maybe special headers
    sender: string;

    // label, tag, designation, topic, subject, method, what, title, description
    // route, handle, resource, destination, name
    summary: string;
    payload: Payload;
}

export interface Reply {
    summary: string;
    payload: Payload;
}

// TODO: make this a discriminated union of supported payload kinds
export interface Payload {
    type: string;
}


// -------------------- MESSAGE SERVER --------------------
export interface MessageServer {
    authenticate(msg: Message): void | Promise<void>; // Fills in `sender` prop? Verifies `sender` prop?
    authorise(msg: Message, orgchart: OrgChart): boolean | Promise<boolean>;
    dispatch(msg: Message): Reply | Promise<Reply>;
}

export const MessageServer = {
    create(): MessageServer {
        throw new Error('Not Implemented');
    },
};


// -------------------- HTTP SERVER --------------------
export interface HttpServer {
    start(): Promise<void>;
    stop(): Promise<void>;
    // TODO: ability to update message server and/or orgchart
    // TODO: ability to inspect message server and/or orgchart
}

export const HttpServer = {
    create(options?: HttpServerOptions): HttpServer {
        options = options;
        throw new Error('Not Implemented');
    },
};

export interface HttpServerOptions {
    port?: number;
    messageServer?: MessageServer;
    orgchart?: OrgChart;
}
