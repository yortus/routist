import Message from './message';





type Dispatcher = (msg: Message) => void | Promise<void>;
export default Dispatcher;
