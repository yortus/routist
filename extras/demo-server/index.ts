import * as express from 'express';
import {createExpressApplication, deny, grant, start, stop} from 'routist';





let subapp = createExpressApplication({});
subapp.refine.access({
    '**': grant.access,
    'GET /foo*': deny.access,
});
subapp.refine.routes({
    'GET /foo{**X}': (req, res) => { res.send(`Something beginning with foo and ending with ${req.fields.X}`); },
    'POST /stop': (_, res) => { stop(app); res.status(200).send(); },
});





let app = express();
app.use(subapp);
app.use((req, res) => {
    res.status(404).send(`EXPRESS UNHANDLED:   ${req.url}`);
});





start(app, 8080);
