import Message from './message';
import User from './user';





type Authenticator = (msg: Message) => User | Promise<User>;
export default Authenticator;
