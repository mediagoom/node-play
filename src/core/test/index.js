import chai from 'chai'
import httprequest from '../../core/httprequest.js'
 
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
                                check(done, () =>{
                                    expect(res.response.statusCode).to.equal(200);
                                });
                        }
                        , (err) => {
                                done(err);
                        }
                    );
        });//return 200

   

});//http request
