
//const chai      = require('chai');

const cp        = require('child_process');
const path      = require('path');

//var expect = chai.expect;




 
describe('PROCESSOR', () => {


    it('has the right environment', (done) => {

        let env_path = process.env.PATH;

        let dirname = path.normalize(path.join(__dirname, '../../../bin'));

        process.env.PATH = dirname + path.delimiter + env_path;

        /*
        console.log("PATH: ", dirname, " ", env_path);
        console.log("----------T-----------");
        console.log(process.env.PATH);
        console.log("----------T-----------");
        */
            
        cp.exec('ffmpeg -version', {env: process.env},  (err/*, stdout, stderr*/) =>{
                
            if(err)
            {
                done(err);
            }

            cp.exec('mg --help', (err/*, stdout, stderr*/) => {
                
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

    
   

});
