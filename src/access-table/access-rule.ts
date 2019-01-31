import AccessContext from './access-context';





type AccessRule = (user: string | null, context: AccessContext) => | 'grant' | 'deny' | 'pass'
                                                                    | Promise<'grant' | 'deny' | 'pass'>;
export default AccessRule;
