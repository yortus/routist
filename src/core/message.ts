




export default interface Message {
    protocol: string;
    headline: string;
}





//TODO: specials:
// - protocol = 'ctrl': receivers emit special control messages using this protocol; Server will intercept them
//   - headline = 'error': Server treats this as a fatal error in the receiver
//   - headline = 'end': Server treats this as end-of-input form receiver; there will be no more messages
