'use strict';
import Request from '../request';
import Response from '../response';





// TODO: doc...
type Handler = (request: Request, downstream?: (request: Request) => Response) => Response;
export default Handler;
