const chai   = require('chai');
const dbg    = require('debug')('node-play:unit-test-flows');
const flows  = require('../../src/flows/encode');
const fs     = require('fs');
const path   = require('path');
//const config = require('../config');

const expect = chai.expect;
const unitTest = require('@mediagoom/opflow/unit-test');

describe('OPERATIONS', () => {

    const keys = Object.keys(flows);
    const dir = path.normalize(path.join(__dirname, './ffprobe'));

    dbg('ffprobe path', dir);

    const probes = fs.readdirSync(dir, {withFileTypes: true});
    
    

    for(let idx = 0; idx < keys.length; idx++)
    {
        const key = keys[idx];

        for(let idj = 0; idj < probes.length; idj++)
        {
            const dirent = probes[idj];

            //if(dirent.isFile() && '.txt' === path.extname(dirent.name))
            if('.txt' === path.extname(dirent))
            {

                it('should run unit test for - flow ' + key + ' ' + dirent , async () => {
            
                    const flow = flows[key]; 
            
                    //dbg('FLOW-TEST', JSON.stringify(flow, null, 4));
                    
                    if(null != flow.root.children[0] && null != flow.root.children[0].children[0]
                        && 'run ffprobe' === flow.root.children[0].children[0].name)
                    {
                        dbg('replace ffprobe', dirent, key);

                        //const file = path.join(dir, dirent.name);
                        const file = path.join(dir, dirent);
                        const ffprobe_output = fs.readFileSync(file, 'utf8');
                        flow.root.children[0].children[0].config.code = `
                        \`
                        ${ffprobe_output}
                        \`
                        `;
                    
                    }

                    try{

                        const operations = await unitTest(flow);
                    
                        const end = operations.find ( (el) => {return el.type === 'END';} );

                        expect(end.completed).to.be.true;

                        dbg('END \n %O', end);
                    
                    }catch(err)
                    {
                        if(undefined !== err.runtime)
                        {
                            const failed = err.runtime.find ( (el) => { return (!el.completed && (el.history.length > 0));});
                            dbg('failed: %O', failed);
                            throw err;
                        }
                    }

                });
            }

        }

    }
});

