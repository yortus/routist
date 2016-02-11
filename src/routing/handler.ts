'use strict';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';
// TODO: split into PartialHandler and GeneralHandler
// Put PartialHandler everywhere literal type (request: Request) => Response appears





// TODO: doc...
interface Handler {


    // TODO: doc...
    (request: Request, downstream: (request: Request) => Response): Response;
}
export default Handler;
