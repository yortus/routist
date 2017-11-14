import * as express from 'express';
import {createExpressApplication} from 'routist';





// TODO: for req.intent etc...  remove...
// tslint:disable-next-line:no-namespace
declare global {
    export namespace Express {
        // tslint:disable-next-line:no-shadowed-variable
        export interface Request {
            user: string;
            fields: { [name: string]: {} };
            intent: string;
        }
    }
}





let subapp = createExpressApplication({});
let app = express();
app.use(subapp);
app.get('/', (req, res, __) => {
    res.send('Hi there at ' + req.intent);
});
app.listen(8080);
