import * as path from 'path';
import * as stackTrace from 'stack-trace';
import Handler from '../handler';





export default function staticFile(filePath: string): Handler {
    let callerFilename: string = stackTrace.get()[1].getFileName();
    let callerDirname = path.dirname(callerFilename);
    filePath = path.resolve(callerDirname, filePath);
    // TODO: ensure path exists...

    return (_req, res) => {
        res.sendFile(filePath);
    };
}
