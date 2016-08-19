




/** Issues the given message as a warning. */
export default function warn(message: string) {
    // TODO: make behaviour switchable via some option (eg console, throw, other logger, etc)
    // TODO: use color? improve message format?
    console.warn(`[routist] WARNING: ${message}`);
}
