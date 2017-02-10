import chai from 'chai'
import httprequest from '../core/httprequest.js'
import TestFile from './file.js'
import Uploader from '../uploader/index.js'
import chaiFiles from 'chai-files';
 
chai.use(chaiFiles);
var expect = chai.expect;

function check( done, f ) {
  try {
    f();
    done();
  } catch( e ) {
    done( e );
  }
}

 
describe("HTTP REQUEST", () => {

        describe("UPLOADER" , () => {

                it("upload a file", (done) => {
                  
                        let forig = 'package.json';
                        let fdest = 'test-file-output.tmp';

                        let t = new TestFile(forig);
                        
                        let opt = {
                                url : 'http://localhost:3000/upload'
                              , name : fdest
                              , chunk_size: 500
                        };
                        let u = new Uploader(t, opt);
                            u.on('completed', () => {
                                    
                                    check(done, () => {
                                        expect(chaiFiles.file(forig)).to.equal(chaiFiles.file(fdest));                        
                                    });
                            });
                            u.on('error', (err) => {done(err);});
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
                                console.log('----------------');
                                //
                                check(done, () =>{
                                    expect(res.request.statusCode).to.equal(200);
                                });
                        }
                        , (err) => {
                                done(err);
                        }
                    );
        });//return 200

   

});//http request
