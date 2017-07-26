import {Handler} from '../router';





export default function notFound(): Handler {
    return (_, res) => {
        res.sendStatus(404);
    };
}
