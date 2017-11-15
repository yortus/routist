




type User = string | GUEST;
export default User;





export interface GUEST { __guestBrand: any; }
export const GUEST = Symbol('GUEST') as any as GUEST;
