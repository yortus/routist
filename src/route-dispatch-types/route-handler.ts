import Request from '../request';
import Response from '../response';





type RouteHandler = (req: Request, res: Response) => void | Promise<void>;
export default RouteHandler;
