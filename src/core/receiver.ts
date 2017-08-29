import Message from './message';





export default interface Receiver {
    start(cb: (msg: Message) => (void|Promise<void>)): void|Promise<void>;
    stop(force?: boolean): void|Promise<void>;
}
