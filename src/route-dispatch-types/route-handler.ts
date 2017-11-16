import Request from '../request';
import Response from '../response';
import CONTINUE from './continue';





type RouteHandler = (req: Request, res: Response) => void | CONTINUE | Promise<void | CONTINUE>;
export default RouteHandler;
