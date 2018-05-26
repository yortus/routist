import * as path from 'path';
import * as stackTrace from 'stack-trace';
import RouteHandler from '../route-handler';





// TODO: need this at all? subsume into staticFiles?
export default function staticFile(filePath: string): RouteHandler {

    // TODO: doc this... resolve rootPath relative to dir of immediate caller
    let callerFilename = stackTrace.get()[1].getFileName();
    let callerDirname = path.dirname(callerFilename);
    filePath = path.resolve(callerDirname, filePath);
    // TODO: ensure path exists... and that it is a file...

    return (_, res) => res.sendFile(filePath);
}
