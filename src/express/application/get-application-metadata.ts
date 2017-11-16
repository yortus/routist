import {Application} from 'express';
import {Server} from 'http';
import {Socket} from 'net';





export default function getApplicationMetadata(app: Application) {
    let metadata = store.get(app);
    if (metadata === undefined) {
        metadata = {
            started: false,
            stopped: false,
            httpServer: undefined,
            openSockets: new Set(),
            cleanup: () => 0,
        };
        store.set(app, metadata);
    }
    return metadata;
}





export interface ApplicationMetadata {
    started: boolean;
    stopped: boolean;
    httpServer?: Server;
    openSockets: Set<Socket>;
    cleanup: () => void;
}





const store = new WeakMap<Application, ApplicationMetadata>();
