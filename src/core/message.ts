




export default interface Message {
    protocol: string;
    headline: string;
}





//TODO: specials:
// - protocol = 'ctrl' or 'sys': receivers emit special control messages using this protocol; Server will intercept them
//   - headline = 'error': Server treats this as a fatal error in the receiver
//   - headline = 'end': Server treats this as end-of-input from receiver; there will be no more messages

// - what about needing to dispatch special messages, eg unauthorised?
