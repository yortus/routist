import Request from '../request';
import Response from '../response';





type RouteHandler = (req: Request, res: Response) => void | 'continue' | Promise<void | 'continue'>;
export default RouteHandler;
