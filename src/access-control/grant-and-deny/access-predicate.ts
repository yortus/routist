import GUEST from '../../guest';
import AccessContext from '../access-context';





type AccessPredicate = (user: string | GUEST, context: AccessContext) => boolean | Promise<boolean>;
export default AccessPredicate;
