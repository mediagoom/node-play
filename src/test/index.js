import httprequest from '../core/httprequest.js'

let r = new httprequest();
    
    r.get('https://www.google.com').then(
        (res) => {
                console.log('*----------------');
                console.log(res.request.statusCode);
                console.log(JSON.stringify(res.request.headers));
                console.log('----------------');
                console.log(res.body);
                console.log('----------------');
        }
        , (err) => {
                console.log(err.message);
                console.log(JSON.stringify(err));
        }
    );
