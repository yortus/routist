import Handler from '../handler';





export default function notFound(): Handler {
    return (_req, res) => {
        res.sendStatus(404);
    };
}
