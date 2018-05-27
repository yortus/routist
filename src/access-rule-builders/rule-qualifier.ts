import {AccessContext} from '../access-table';
import GUEST from '../guest';





type RuleQualifier = (user: string | GUEST, context: AccessContext) => boolean | Promise<boolean>;
export default RuleQualifier;
