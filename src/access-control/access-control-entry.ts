import Policy from './policy';
import {OperationsPredicate, SubjectsPredicate} from './predicates';





export default interface AccessControlEntry {
    subjectsPredicate: SubjectsPredicate;
    operationsPredicate: OperationsPredicate;
    policy: Policy;
}
