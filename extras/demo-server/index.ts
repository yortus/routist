import * as express from 'express';
import {createExpressApplication, grant} from 'routist';





let subapp = createExpressApplication({});
subapp.refine.access({
    '**': grant.access,
});
subapp.refine.routes({
    'GET /foo{**X}': (req, res) => { res.send(`Something beginning with foo and ending with ${req.fields.X}`); },
});





let app = express();
app.use(subapp);
app.listen(8080);
