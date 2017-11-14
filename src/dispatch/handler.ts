import {Response} from 'express';
import {AugmentedRequest} from '../express';





type Handler = (req: AugmentedRequest, res: Response) => void | Promise<void>;
export default Handler;
