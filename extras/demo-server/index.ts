import * as express from 'express';
import {createExpressApplication} from 'routist';





let subapp = createExpressApplication({});





let app = express();
app.use(subapp);
app.listen(8080);
