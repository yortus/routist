import GUEST from '../../guest';
import AccessPredicate from '../grant-and-deny/access-predicate';





export const isLoggedIn: AccessPredicate = user => user !== GUEST;





export const isGuest: AccessPredicate = user => user === GUEST;





export function is(name: string | {field: string}) {
    let result: AccessPredicate = (user, ctx) => {
        if (typeof name === 'string') {
            return user === name;
        }
        else {
            return user === ctx.params[name.field];
        }
    };
    return result;
}





export default {isLoggedIn, isGuest, is};
