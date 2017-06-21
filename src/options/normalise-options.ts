import HttpServerOptions from './http-server-options';





// TODO: doc...
export default function normaliseOptions(options: Partial<HttpServerOptions>): HttpServerOptions {

    let port = options.port || 8080;
    let secret = 'tH3 TRut4 i$ 0UT tH3rE'; // TODO: ... default to no secret...

    let normalised: HttpServerOptions = {
        port,
        secret
    };

    validateOptions(normalised);

    return normalised;
}





// TODO: doc...
function validateOptions(options: HttpServerOptions) {

    // TODO: add checks...
    options;
    return;
}
