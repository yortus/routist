import {AugmentedRequest} from '../express';
import Permission from './permission';





type AccessGuard = (req: AugmentedRequest) => Permission | Promise<Permission>;
export default AccessGuard;
