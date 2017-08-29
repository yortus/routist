import {AccessControlList} from '../access-control';
import Message from '../message';





// TODO: doc accepted `subjects` formats:
//       a) '*', meaning *all possible roles*
//       b) a single role. E.g.: 'manager'
//       c) a conjunction of roles, separated by spaces. E.g.: 'it manager'
// TODO: validate subjects here?
export default function allow(subjects: string) {
    return (classProto: any, propertyKey: string) => {
        let acl = AccessControlList.for(classProto);
        let operations = propertyKey;
        acl.push(subjects, operations, monotonousAllowPolicy);
    };
}





function monotonousAllowPolicy(_: Message) {
    return true;
}
