import Message from './message';
import User from './user';





type Dispatcher = (msg: Message, user: User) => void | Promise<void>;
export default Dispatcher;
