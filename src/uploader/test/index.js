import chai from "chai";
import TestFile from "./file.js";
import Uploader from "../index.js";
import chaiFiles from "chai-files";
 
chai.use(chaiFiles);
var expect = chai.expect;

function tval(name, def)
{
    if(null == process.env[name])
        {
        return def;
    }

    return process.env[name];
}


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
                  
            let forig = tval("TESTFILE", "./src/uploader/test/mediagoom.jpg");
            let fdest = "test-file-output.tmp";
                       
            let t = new TestFile(forig);
                        
            let opt = {
                url : tval("TESTURL", "http://localhost:3000/upload")
                              , name : fdest
                              , chunk_size: 500
            };
                        
            let u = new Uploader(t, opt);
            u.on("completed", () => {
                                    
                check(done, () => {
                    expect(chaiFiles.file(forig)).to.equal(chaiFiles.file(fdest));                        
                });
            });
            u.on("error", (err) => {done(err);});
            u.start();

        });
    });



   

});//http request
