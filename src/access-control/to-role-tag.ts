import RoleTag from './role-tag';
import UserOptions from './user-options';





// TODO: doc...
// TODO: decide restrictions on chars, currently: only lowercase alphanum + hyphen
export default function toRoleTag(value: string, options?: UserOptions): RoleTag {
    let result = value as RoleTag;
    let isValid = /^[a-z0-9-]+$/.test(result);
    isValid = isValid && (!options || !options.isRole || options.isRole(result));
    if (!isValid) throw new Error(`Invalid or unknown role '${result}'`); // TODO: improve message - why invalid
    return result;
}
