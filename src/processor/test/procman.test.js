import chai from "chai";
import ProcMan  from "../../processor/procman.js";

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

function test_proc_man(require_string, owner)
{
    let p     = new ProcMan({statusman : require_string});
    let id    = "";
    //let owner = "uploader";
    let name  = "TEST";

    it("reserve name", (done) => {
               
        p.reserve_name(owner, name).then( (idx) => {

            check(done, () => {
                            
                expect(idx).to.be.a("string");
                    
                id = idx;

                console.log("-----", id, "------");
                        
            });
        }
            , (err) => {
            done(err);
        });

    });

    it("queue job", (done) => {
               

        let file = tval("TESTMEDIAFILE", "./src/processor/test/MEDIA1.MP4");

        

        p.queue_job(owner, id, file).then(
            () => {check(done, ()=> {
                expect(id).to.be.a("string");     
                expect(id).to.be.match(/\d{10,12}_TEST/);
            });
            }, (err) => done(err));
                   

    });


    it("list", (done) => {
        
        p.list(owner).then(
                 (list) => {
                    
                     check(done, ()=> {
                        
                         let r = {
                             assets : [
                                 {
                                     owner : owner
                                            , id : id
                                 }
                             ]
                         };

                         expect(list).to.be.deep.equal(r);

                     });
                 
                 }

               , (err) => {done(err);}

           );
        
    });



    it("status", (done) => {
        
        let r = {
            status   : "ok"
                    , name   : "TEST"        
                    , id     : id
                    , datetime : null
                    , creationtime : null
                    , owner  : owner
                    , hls3   : "STATIC/main.m3u8"
                    , dash   : "STATIC/index.mpd"
                    , thumb  : ["img001.jpg", "img002.jpg"]
                    , previus: ["reserved","analized","encoded"]
                    , hls4   : null
                    , playready : null
                    , widevine: null
        };

        p.status(owner, id).then(
                  (status) => {

                      status.datetime = null;
                      status.creationtime  = null;
                      
                      
                      check(done, () => {
                      
                          expect(status).to.be.deep.equal(r);
                      
                      });

                  }
                , (err) => {done(err);}
            );
        
        
    });



}


describe("PROCESS MANAGER", () => {

    it("set up correctly", (done) => {
                    
        expect(ProcMan).to.be.a("function");
                  
        let p = new ProcMan();
                  
        expect(p).to.be.a("object");

        check(done, ()=> {

            //console.log(p.get_full_name());
            //console.log(p.get_target_dir());

        });

    });

   
    describe("Fake StatMan", () => {

        test_proc_man("./test/stateman.js", "uploader");
        
    });

    describe("Fs StatMan", () => {
        test_proc_man("./statmanfs.js", "statman");
    });
});
