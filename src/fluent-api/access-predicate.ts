import Request from '../request';





type AccessPredicate = (req: Request) => boolean | Promise<boolean>;
export default AccessPredicate;
