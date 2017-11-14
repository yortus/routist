import {Handler} from '../route-table';





export default function notFound(): Handler {
    return msg => {
        msg.response.sendStatus(404);
    };
}
