import {declarationsFor} from '../access-control';





// TODO: doc... validate subjects... what formats are allowed?
export default function deny(subjects: string) {
    return (classProto: any, propertyKey: string) => {
        let declarations = declarationsFor(classProto);
        declarations.push({subjects, operations: propertyKey, policy: 'deny'});
    };
}
