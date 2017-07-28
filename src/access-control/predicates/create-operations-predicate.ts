import UserOptions from '../user-options';
import OperationsPredicate from './operations-predicate';





// TODO: doc format is just a route pattern... always?
export default function createOperationsPredicate(operations: string, options?: UserOptions) {
    // TODO: need any checks or transforms? need to use anything from options?
    options = options;
    return operations as OperationsPredicate;
}
