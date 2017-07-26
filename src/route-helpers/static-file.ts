import * as path from 'path';
import * as stackTrace from 'stack-trace';
import {Handler} from '../router';





export default function staticFile(filePath: string): Handler {

    // TODO: doc this... resolve rootPath relative to dir of immediate caller
    let callerFilename = stackTrace.get()[1].getFileName();
    let callerDirname = path.dirname(callerFilename);
    filePath = path.resolve(callerDirname, filePath);
    // TODO: ensure path exists...

    return (_, res) => {
        res.sendFile(filePath);
    };
}
