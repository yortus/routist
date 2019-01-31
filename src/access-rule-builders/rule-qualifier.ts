import {AccessContext} from '../access-table';





type RuleQualifier = (user: string | null, context: AccessContext) => boolean | Promise<boolean>;
export default RuleQualifier;
