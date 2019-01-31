




export default interface AccessContext {
    user: string | null;
    path: string;
    params: {[name: string]: string};
}
