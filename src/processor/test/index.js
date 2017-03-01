import chai from "chai";
import Processor from "../../processor/index.js";
import cp   from "child_process";

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

 
describe("PROCESSOR", () => {

    it("has the right enviroment", (done) => {
            
        cp.exec("ffmpeg -version", (err/*, stdout, stderr*/) =>{
                
            if(err)
                {
                done(err);
            }

            cp.exec("mg --help", (err/*, stdout, stderr*/) => {
                
                if(err)
                    {
                    done(err);
                }
                else
                    {
                    done();
                }
                    
                
            });

            
        });
    });

    it("set up correctly", (done) => {
                    
        expect(Processor).to.be.a("function");
                  
        let n = tval("TESTNAME", "TEST");
        let p = new Processor(n);
                  
        expect(p).to.be.a("object");

        check(done, ()=> {

            //console.log(p.get_full_name());
            //console.log(p.get_target_dir());

        });


    });//return 200

    describe("Elaborate", () => {


        let n    = tval("TESTNAME", "TEST");
        let p    = new Processor(n, {destination: "./uploader"});
        let file = tval("TESTMEDIAFILE", "./src/processor/test/MEDIA1.MP4");

        let result = [ { index: "0"
                                   ,  lang: "und"
                                   ,  kind: "Video"
                                   ,  width: "1024"
                                   ,  height: "576"
                                   ,  kz: undefined
                                   ,  bps: "674" }
                                  , { index: "1"
                                    , lang: "und"
                                    , kind: "Audio"
                                    , width: undefined
                                    , height: undefined
                                    , kz: "48000"
                                    , bps: "96" } 
        ];


        it("get streams", (done) => {
               
            p.read_stream_info(file).then((streams) => {

                check(done, () => {
                            
                    expect(streams).to.be.a("object");

                            //console.log(streams);
                            //

                   expect(streams.streams).to.be.deep.equal(result);
                            
                        
                });
            }
            , (err) => {
                done(err);
            });

        });



        it("encode", (/*done*/) => {
            
            expect(result.length).to.be.equal(2);

            return p.encode(file, result);
                

        });

    });

});
