import {Application} from 'express';
import {Socket} from 'net';
import debug from '../../util/debug';
import getApplicationMetadata from './get-application-metadata';





// TODO: ...
export function start(app: Application, port: number) {
    let meta = getApplicationMetadata(app);

    // Fail if already started
    if (meta.started) {
        throw new Error(`HttpServer already started.`);
    }
    meta.started = true;

    // Start the HTTP server asynchronously.
    return new Promise<void>((resolve, reject) => {

        // Begin listening for incoming HTTP requests.
        meta.httpServer = app.listen(port, () => {
            debug(`HttpServer listening on port ${port}`);
            resolve();
        })

        // Keep track of open connections, so they can be manually closed in `stop` if necessary.
        .on('connection', (socket: Socket) => {
            meta.openSockets.add(socket);
            socket.on('close', () => meta.openSockets.delete(socket));
        })

        // Detect server startup failure.
        .once('error', (err: any) => {
            reject(err);
        });
    });
}





// TODO: ...
export function stop(app: Application) {
    let meta = getApplicationMetadata(app);

    // Fail if not started or already stopped
    if (!meta.started || meta.stopped) {
        throw new Error(`HttpServer not started or already stopped.`);
    }
    meta.stopped = true;

    // Stop the HTTP server asynchronously.
    return new Promise<void>((resolve, reject) => {

        // Ask the HTTP server to stop accepting new connections.
        meta.httpServer!.close((err: any) => {
            if (err) return reject(err);
            debug(`HttpServer closed`);
            resolve();
        });

        // Perform metadata-defined cleanup steps on the express app.
        meta.cleanup();

        // If there are still open connections, give them a second to close themselves, then destroy any remaining.
        if (meta.openSockets.size > 0) {
            let destroyOpenSockets = () => {
                let count = meta.openSockets.size;
                meta.openSockets.forEach(socket => socket.destroy());
                debug(`${count} socket(s) remained open and were forcibly destroyed`);
            };
            setTimeout(destroyOpenSockets, 1000);
        }
    });
}
