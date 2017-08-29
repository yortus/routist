import User from './user';





// TODO: doc... special sentinel user
const GUEST = {
    toString() {
        return 'GUEST';
    },
} as User;
export default GUEST;
