import {GUEST} from '../identity-types';
import Request from '../request';





// TODO: explain...
export const user = {
    isLoggedIn: (req: Request) => req.user !== GUEST,
    isGuest: (req: Request) => req.user === GUEST,
    is: (name: string | {field: string}) => {
        return (req: Request) => {
            if (typeof name !== 'string') name = req.fields[name.field] as string;
            return req.user === name;
        };
    },
};
