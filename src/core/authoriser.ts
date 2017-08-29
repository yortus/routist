import Message from './message';
import Role from './role';





type Authoriser = (msg: Message, roles: Role[]) => boolean | Promise<boolean>;
export default Authoriser;
