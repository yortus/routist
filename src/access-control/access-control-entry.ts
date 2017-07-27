import Policy from './policy';
import {OperationsPredicate, SubjectsPredicate} from './predicates';





export default interface AccessControlEntry {
    subjects: SubjectsPredicate;
    operations: OperationsPredicate;
    policy: Policy;
}
