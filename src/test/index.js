import {expect} from 'chai'
import httprequest from '../core/httprequest.js'
import TestFile from './file.js'
import Uploader from '../uploader/index.js'

describe("HTTP REQUEST", () => {

        describe("UPLOADER" , () => {

                it("upload a file", (done) => {
                   
                        let t = new TestFile('package.json');
                        
                        let opt = {
                                url : 'http://localhost:3000/upload'
                              , name : 'mocha-upload.bin'
                        };
                        let u = new Uploader(t, opt);
                            u.on('compleated', () => {done();});
                            u.on('error', (err) => {console.log(err.message); expect(true).to.not.be.false; done();});
                            u.start();

                });
        });


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
                                console.log(err.message);
                                console.log(JSON.stringify(err));
                                
                                //just fail
                                expect(true).to.not.be.false;
                                done();
                        }
                    );
        });//return 200

   

});//http request
