import {CONTINUE, RouteHandler} from '../route-dispatch-types';





// TODO: doc...
export default function rpcMethods(rpcObj: {[methodName: string]: (_: any) => Promise<any>}): RouteHandler {

    return async (req, res) => {
        // TODO: all thrown errors in here should use httperr or similar
        //       (otherwise client gets no useful message/feedback)

        // Ensure HTTP method is 'POST'
        if (req.method !== 'POST') throw new Error(`RPC route expected HTTP POST but received HTTP ${req.method}`);

        // Ensure the route table entry captured a `methodName` field.
        if (typeof req.fields.methodName !== 'string') throw new Error(`RPC route expects a 'methodName' field`);
        let methodName = req.fields.methodName as string;

        // If the method name doesn't exist on `rpcObj`, then don't handle the request.
        if (!rpcObj.hasOwnProperty(methodName)) return CONTINUE;

        // Expect `req.body` to be an array corresponding to method args
        if (!Array.isArray(req.body)) throw new Error(`RPC route expects body to be an array of args`);
        let args = req.body;
        // TODO: validate/check body further?

        // Call the RPC method
        let result = await rpcObj[methodName].apply(null, args);

        // TODO: validate/check response before sending?

        // Send back the result in the response
        res.json(result);
        return;
    };
}
