




interface Request {

    from: MessageEndpoint;

    to:  MessageEndpoint;

    topic: MessageTopic;

    payload: MessagePayload;

    metadata: MessageMetadata;
}


interface MessageEndpoint {
    type: string;
    // session/userid/client/remoteip/referrer
    // domain/ip/host/port etc
    // address/route/querystring
}

interface MessageTopic {
    type: string;
    // address/route/querystring etc
    resource: string; //... topic/address/route/service etc
    action: '?' | '??' //... verb/method/mode etc
}

interface MessagePayload {
    type: string;
    // json/file etc
}

interface MessageMetadata {
    type: string;

}