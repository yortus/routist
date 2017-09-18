import Message from './message';
import User from './user';





type Authoriser = (msg: Message, user: User) => boolean | Promise<boolean>;
export default Authoriser;
