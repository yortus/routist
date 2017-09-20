import * as multumethods from 'multimethods';
import {Dispatcher, Message, User} from '../../core';





export default function makeHttpDispatcher(): Dispatcher {

    let mm = multumethods.create<Message, User, void>({
        async: undefined,
        arity: 2,
    });
    return mm;
}
