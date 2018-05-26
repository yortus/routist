import GUEST from '../../guest';
import RuleQualifier from '../rule-qualifier';





export const isLoggedIn: RuleQualifier = user => user !== GUEST;





export const isGuest: RuleQualifier = user => user === GUEST;





export function is(name: string | {field: string}) {
    let result: RuleQualifier = (user, ctx) => {
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
