'use strict';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';





// TODO: doc...
interface Handler {


    // TODO: doc...
    (request: Request, downstream: (request: Request) => Response): Response;


    // TODO: temporary! de-couple pattern&handler. Then make 'Rule' = pattern + handler
    pattern: Pattern;


    // TODO: add these...
    isDecorator: boolean;
}
export default Handler;
