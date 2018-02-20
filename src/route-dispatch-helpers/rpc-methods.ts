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

        // TODO: validate/check body at all?

        // Call the RPC method
        let result = await rpcObj[methodName].call(null, req.body);

        // TODO: validate/check response before sending?

        // Send back the result in the response
        res.json(result);
        return;
    };
}
