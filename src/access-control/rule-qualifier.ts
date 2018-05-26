import GUEST from '../guest';
import AccessContext from './access-context';





type RuleQualifier = (user: string | GUEST, context: AccessContext) => boolean | Promise<boolean>;
export default RuleQualifier;
