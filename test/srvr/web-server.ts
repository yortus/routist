'use strict';
import * as http from 'http';





let httpListener = (req: http.IncomingMessage, res: http.ServerResponse) => {
    console.log('request received');
    res.statusCode = 200;
    res.write('<h1>Hello, World!</h1>');
    res.end();
};
let httpServer = http.createServer(httpListener);
httpServer.listen(1337);
console.log(`Web server listening on port ${1337}`);