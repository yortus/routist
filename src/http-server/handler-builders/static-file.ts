import Handler from '../handler';





export default function staticFile(filePath: string): Handler {
    return (_req, res) => {
        res.sendFile(filePath);
    };
}
