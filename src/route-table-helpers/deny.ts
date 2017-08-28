import {AccessControlList} from '../access-control';
import Message from '../message';





// TODO: doc accepted `subjects` formats:
//       a) '*', meaning *all possible roles*
//       b) a single role. E.g.: 'manager'
//       c) a conjunction of roles, separated by spaces. E.g.: 'it manager'
// TODO: validate subjects here?
export default function deny(subjects: string) {
    return (classProto: any, propertyKey: string) => {
        let acl = AccessControlList.for(classProto);
        let operations = propertyKey;
        acl.push(subjects, operations, monotonousDenyPolicy);
    };
}





function monotonousDenyPolicy(_: Message) {
    return false;
}
