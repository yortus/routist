import {Request} from 'express';
import Permission from './permission';





type AccessGuard = (req: Request) => Permission | Promise<Permission>;
export default AccessGuard;
