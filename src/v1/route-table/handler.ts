import Message from '../message';





// TODO: is there a better sentinel value than `false` to indicate a handler didn't handle the req/res?
// TODO: how does this interact with the CONTINUE sentinel? Expose it through API?





type Handler = (msg: Message, captures: {[name: string]: string}) => HandlerResult;
export default Handler;





export type HandlerResult = false | void | Promise<false | void>;
