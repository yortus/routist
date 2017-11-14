import * as express from 'express';
import {createExpressApplication, grant} from 'routist';





let subapp = createExpressApplication({});
subapp.refine.access({
    '**': grant.access,
});





let app = express();
app.use(subapp);
app.listen(8080);
