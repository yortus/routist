import RoleTag from '../role-tag';
import toRoleTag from '../to-role-tag';
import toUserTag from '../to-user-tag';
import UserOptions from '../user-options';
import UserTag from '../user-tag';
import SubjectsPredicate from './subjects-predicate';





// TODO: doc accepted `subjects` formats:
//       a) a single usertag, prefixed with'@'. E.g.: '@bob'
//       b) a single roletag. E.g.: 'manager'
//       c) a conjunction of roletags, separated by spaces. E.g.: 'it manager'
export default function createSubjectsPredicate(subjects: string, options?: UserOptions) {
    let user: UserTag;
    let roles: RoleTag[];

    if (subjects.startsWith('@')) {
        user = toUserTag(subjects.slice(1), options); // NB: may throw

        // TODO: get *all* implied roles for this user...
        roles = [];
        if (options && options.getImpliedRoles) {
            roles = options.getImpliedRoles(user);
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < roles.length; ++i) { // NB: the array may grow at each iteration
                let moreRoles = options.getImpliedRoles(roles[i]);
                moreRoles.forEach(role => roles.indexOf(role) === -1 ? roles.push(role) : null);
            }
        }
    }
    else {
        user = '*' as UserTag;
        roles = subjects.split(/[ ]+/).map(s => toRoleTag(s, options)); // NB: may throw

        // TODO: expand to include *all* implied roles...
        if (options && options.getImpliedRoles) {
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < roles.length; ++i) { // NB: the array may grow at each iteration
                let moreRoles = options.getImpliedRoles(roles[i]);
                moreRoles.forEach(role => roles.indexOf(role) === -1 ? roles.push(role) : null);
            }
        }
    }

    // TODO: sort the roles...
    roles.sort();

    // TODO: compute the predicate...
    let rolesStr = '*<' + roles.join('>*<') + '>*';
    let result = `${user}:${rolesStr === '*<>*' ? '*' : rolesStr}` as SubjectsPredicate;
    return result;
}
