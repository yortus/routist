import {declarationsFor} from '../access-control';





// TODO: doc... validate subjects... what formats are allowed?
export default function allow(subjects: string) {
    return (classProto: any, propertyKey: string) => {
        let declarations = declarationsFor(classProto);
        declarations.push({subjects, operations: propertyKey, policy: 'allow'});
    };
}
