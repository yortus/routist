'use strict';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';





// TODO: doc...
interface Handler {


    // TODO: doc...
    (request: Request, downstream: (request: Request) => Response): Response;
}
export default Handler;
