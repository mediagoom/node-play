
const expect    = require('chai').expect;

const cp        = require('child_process');
const path      = require('path');

async function Exec(exec, options)
{
    return new Promise( ( resolve, reject) => {
        
        cp.exec(exec, options, (err, stdout, stderr) => {
            if(null != err)
            {
                reject(err);
            }
            else
            {
                resolve({stdout, stderr});
            }
        });
    });
}

 
describe('PROCESSOR', () => {

    it('has the right environment', async () => {

        let env_path = process.env.PATH;

        let dirname = path.normalize(path.join(__dirname, '../../../bin'));

        process.env.PATH = dirname + path.delimiter + env_path;

        await Exec('ffmpeg -version', {env: process.env});

        await Exec('mg --help', {} );

        let thrown = false;

        try{
            await Exec('mg -i:wrong-path', {});
        }catch(err)
        {
            thrown = true;
        }

        expect(thrown).to.be.true;

    });

});
