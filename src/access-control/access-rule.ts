import GUEST from '../guest';
import AccessContext from './access-context';





type AccessRule = (user: string | GUEST, context: AccessContext) => | 'grant' | 'deny' | 'pass'
                                                                    | Promise<'grant' | 'deny' | 'pass'>;
export default AccessRule;
