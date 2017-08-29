import * as multimethods from 'multimethods';
import Message from '../message';
import AccessControlConfiguration from './access-control-configuration';





// TODO: doc...
export default class AccessControlList {

    static for(prototype: object): AccessControlList {

        // If the given prototype object is already associated with an ACL, return it now
        if (map.has(prototype)) return map.get(prototype)!;

        // Create a new ACL and associate it with the given prototype object.
        let acl = new AccessControlList(prototype);
        map.set(prototype, acl);
        return acl;
    }

    push(subjects: string, operations: string, policy: (msg: Message) => boolean): void {
        this.entries.push({subjects, operations, policy});
    }

    toPolicy(config: AccessControlConfiguration): (msg: Message) => boolean {

        // TODO: handling prototype chains (eg one RouteTable extends another)...
        // - Do they inherit/accumulate? Otherwise? Need practical examples to decide...

        let toDiscriminant = (msg: Message) => {
            // TODO: memoize the role calcs...
            let roles = config.getAllImpliedRoles(msg.roles);
            return `${roles.map(role => `<${role}>`).join('')}/${msg.discriminant}`;
        };

        let methods = {} as {[predicate: string]: (msg: Message) => boolean};
        this.entries.forEach(entry => {
            let roles = config.getAllImpliedRoles(entry.subjects.split(/[ ]+/));
            if (roles.length === 0) throw new Error(`Internal error: empty roles array`);
            let rolesPredicate = roles[0] === '*' ? '*' : `*<${roles.join('>*<')}>*`;
            methods[`${rolesPredicate}/${entry.operations}`] = entry.policy;
        });

        let mm = multimethods.create<Message, boolean>({
            arity: 1,
            async: false, // TODO: allow async policies
            toDiscriminant,
            methods,
        });
        return mm;
    }

    private constructor(associatedPrototype: object) {
        this.associatedPrototype = associatedPrototype;
        this.entries = [];
    }

    private associatedPrototype: object;

    private entries: AccessControlEntry[];
}





// TODO: doc...
export interface AccessControlEntry {
    subjects: string;
    operations: string;
    policy: (msg: Message) => boolean;
}





// TODO: doc...
const map = new WeakMap<object, AccessControlList>();
