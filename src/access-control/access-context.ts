import GUEST from '../guest';





export default interface AccessContext {
    user: string | GUEST;
    path: string;
    params: {[name: string]: string};
}
