import * as http from 'http';
import * as _ from 'lodash';
let Cookies = require('cookies');





// TODO: don't hardcode these - put where? config? env?
const keys = ['tH3 tRuTH iS 0Ut TH3rE'];
const expiryMinutes = 90;





// TODO:...
export function loadFromRequest(request: http.IncomingMessage, response: http.ServerResponse) {
    let cookies = new Cookies(request, response, {keys});
    let cookie = cookies.get('sid', { signed: true });
    //let remoteIP = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    let session = decode(cookie);//, remoteIP);
    return session;
}





// TODO:...
export function saveToResponse(request: http.IncomingMessage, response: http.ServerResponse, session: any) {
    let cookies = new Cookies(request, response, {keys});
    if (session && !_.isEmpty(session)) {

        // TODO: ...
        //let remoteIP = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        let cookie = encode(session);//, remoteIP);
        let expiryDate = new Date(new Date().getTime() + expiryMinutes * 60 * 1000);
        cookies.set('sid', cookie, { expires: expiryDate, signed: true });
    }
    else {

        // Session is falsy, so delete the cookie
        cookies.set('sid', null, { signed: true });
    }
}





// TODO: could encrypt/decrypt as well, then don't need to sign the cookie.
function decode(cookie: string) {
    try {
        let parts = JSON.parse(cookie);
        if (!_.isArray(parts) || parts.length !== 1) return {};
        return parts[0];
    }
    catch (err) {
        return {};
    }
}





// TODO: ...
function encode(session: {}) {
    return JSON.stringify([session]);
}
