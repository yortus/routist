import GUEST from './guest';
import Message from './message';
import ServerOptions from './server-options';





export default class Server {
    constructor(private options: ServerOptions) {
        // TODO:
        // - validate options
        // - convert options to configuration
    }

    async start(): Promise<void> {
        return this.options.receiver.start(msg => processMessage(msg, this.options));
    }

    async stop(): Promise<void> {
        return this.options.receiver.stop();
    }
}





async function processMessage(msg: Message, options: ServerOptions) {
    console.log(`Incoming message: ${msg.protocol} ${msg.headline}`);
    let user = await options.authenticator(msg);
    console.log(`    user is ${user}`);
    let isAuthorised = await options.authoriser(msg, user);
    console.log(`    ${isAuthorised ? '' : 'un'}authorised`);

    await options.dispatcher(msg, GUEST); // TODO: fix user
}
