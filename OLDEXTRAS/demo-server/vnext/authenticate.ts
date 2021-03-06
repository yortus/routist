import {Handler} from './express/create-dispatcher-middleware';





// TODO: ...
export default function authenticate(usernameField = 'username', passwordField = 'password'): Handler {

    return (req, res) => {
        let usn = req.fields[usernameField] as string;
        let pwd = req.fields[passwordField] as string;

        if (typeof usn !== 'string' || typeof pwd !== 'string') {
            res.status(400);
            res.send(`"${usernameField}" and/or "${passwordField}" not provided`);
            return;
        }

        if (usn === '') {
            req.user = null;
            res.status(200).send('ok');
            return;
        }


        // TODO: temp testing...
        let isValid = ['amy', 'bob', 'cal', 'dan'].includes(usn);
        isValid = isValid && pwd === 'passw0rd';


        if (isValid) {
            req.user = usn;
            res.status(200).send('ok');
            return;
        }

        res.status(403);
        res.send('Invalid username/password combination');
    };
}
