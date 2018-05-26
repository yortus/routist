import Request from '../request';
import Permission from './permission';





type AccessRule = (req: Request) => Permission | Promise<Permission>;
export default AccessRule;
