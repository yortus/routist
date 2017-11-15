import Request from '../request';
import Permission from './permission';





type AccessGuard = (req: Request) => Permission | Promise<Permission>;
export default AccessGuard;
