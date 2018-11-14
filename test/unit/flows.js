const chai   = require('chai');
const dbg    = require('debug')('node-play:unit-test-flows');
const flows  = require('../../flows/encode');
//const config = require('../config');

const expect = chai.expect;
const unitTest = require('@mediagoom/opflow/unit-test');

describe('OPERATIONS', () => {

    const keys = Object.keys(flows);

    for(let idx = 0; idx < keys.length; idx++)
    {
        const key = keys[idx];

        it('should run unit test for flow ' + key , async () => {
           
            const flow = flows[key]; 
           
            dbg('FLOW-TEST', JSON.stringify(flow, null, 4));
            
            const operations = await unitTest(flow);

            const end = operations.find ( (el) => {return el.type === 'END';} );

            expect(end.completed).to.be.true;

            dbg('ENCODE OPERATIONS \n %O', operations);

        });

    }
});

