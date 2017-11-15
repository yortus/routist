




// TODO: restore...?
// export function start() {

//     // Fail if already started
//     if (started) {
//         throw new Error(`HttpServer already started.`);
//     }
//     started = true;

//     // Start the HTTP server asynchronously.
//     return new Promise<void>((resolve, reject) => {

//         // Begin listening for incoming HTTP requests.
//         httpServer = app.listen(config.port, () => {
//             debug(`HttpServer listening on port ${config.port}`);
//             resolve();
//         })

//         // Keep track of open connections, so they can be manually closed in `stop` if necessary.
//         .on('connection', (socket: net.Socket) => {
//             openSockets.add(socket);
//             socket.on('close', () => openSockets.delete(socket));
//         })

//         // Detect server startup failure.
//         .once('error', (err: any) => {
//             reject(err);
//         });
//     });
// }





// TODO: restore...?
// export function stop() {

//     // Fail if not started or already stopped
//     if (!started || stopped) {
//         throw new Error(`HttpServer not started or already stopped.`);
//     }
//     stopped = true;

//     // Stop the HTTP server asynchronously.
//     return new Promise<void>((resolve, reject) => {

//         // Ask the HTTP server to stop accepting new connections.
//         httpServer.close((err: any) => {
//             if (err) return reject(err);
//             debug(`HttpServer closed`);
//             resolve();
//         });

//         // Perform shutdown steps on the express app.
//         if (fileStoreOptions.reapIntervalObject) {
//             clearInterval(fileStoreOptions.reapIntervalObject!);
//         }

//         // If there are still open connections, give them a second to close, otherwise destroy them.
//         if (openSockets.size > 0) {
//             let destroyOpenSockets = () => openSockets.forEach(socket => socket.destroy());
//             setTimeout(destroyOpenSockets, 1000);
//         }
//     });
// }
