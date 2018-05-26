import GUEST from '../../guest';
import Request from '../../request';





export default {isLoggedIn, isGuest, is};





export function isLoggedIn(req: Request) {
    return req.user !== GUEST;
}





export function isGuest(req: Request) {
    return req.user === GUEST;
}





export function is(name: string | {field: string}) {
    return (req: Request) => {
        if (typeof name !== 'string') name = req.fields[name.field] as string;
        return req.user === name;
    };
}
