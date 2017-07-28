import Policy from './policy';
import {OperationsPredicate, SubjectsPredicate} from './predicates';





export default interface AccessControlEntry {
    subjectPredicate: SubjectsPredicate;
    operationPredicate: OperationsPredicate;
    policy: Policy;
}
