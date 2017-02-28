import chai from 'chai'
import Processor from '../../processor/index.js'
 
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

     it("set up processor", (done) => {
                    
                  expect(Processor).to.be.a('function');
                  
                  let n = tval("TESTNAME", "TEST");
                  let p = new Processor(n);
                  
                  expect(p).to.be.a('object');

                  check(done, ()=> {

                      console.log(p.get_full_name());
                      console.log(p.get_target_dir());

                  });


        });//return 200

     it("get streams", (done) => {
     
            
            let n = tval("TESTNAME", "TEST");
            let p = new Processor(n);
            let file = tval("TESTMEDIAFILE", "./src/processor/test/MEDIA1.MP4");

            p.read_stream_info(file).then((streams) => {
                check(done, () => {
                    
                    expect(streams).to.be.a('object');

                    console.log(streams);
                
                });
            }
            , (err) => {
                done(err);
            }
            );

     });

});//http request
