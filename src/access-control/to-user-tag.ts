import UserOptions from './user-options';
import UserTag from './user-tag';





// TODO: doc...
// TODO: decide restrictions on chars, currently: only lowercase alphanum + hyphen
export default function toRoleTag(value: string, options?: UserOptions): UserTag {
    let result = value as UserTag;
    let isValid = /^[a-z0-9-]$/.test(result);
    isValid = isValid && (!options || !options.isUser || options.isUser(result));
    if (!isValid) throw new Error(`Invalid or unknown user '${result}'`); // TODO: improve message - why invalid
    return result;
}
