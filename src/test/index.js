import {expect} from 'chai'
import httprequest from '../core/httprequest.js'

describe("HTTP REQUEST", () => {

        it("return 200 for google.com", (done) => {

                let r = new httprequest();
                    
                    r.get('https://www.google.com').then(
                        (res) => {
                                //console.log('*----------------');
                                //console.log(res.request.statusCode);
                                //console.log(JSON.stringify(res.request.headers));
                                //console.log('----------------');
                                //console.log(res.body);
                                //console.log('----------------');
                                //
                                expect(res.request.statusCode).to.equal(200);
                                done();
                        }
                        , (err) => {
                                //console.log(err.message);
                                //console.log(JSON.stringify(err));
                                
                                //just fail
                                expect(true).to.not.be.false;
                        }
                    );
        });//return 200

});//http request
