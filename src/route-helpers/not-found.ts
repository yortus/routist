import {Handler} from '../router';





export default function notFound(): Handler {
    return msg => {
        msg.response.sendStatus(404);
    };
}
