import * as express from 'express';
import {createExpressApplication, deny, grant} from 'routist';





let subapp = createExpressApplication({});
subapp.refine.access({
    '**': grant.access,
    'GET /foo*': deny.access,
});
subapp.refine.routes({
    'GET /foo{**X}': (req, res) => { res.send(`Something beginning with foo and ending with ${req.fields.X}`); },
});





let app = express();
app.use(subapp);
app.use((req, res) => {
    res.status(404).send(`EXPRESS UNHANDLED:   ${req.url}`);
});
app.listen(8080);
