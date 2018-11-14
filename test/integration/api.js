const expect   = require('chai').expect;
const dbg      = require('debug')('node-play:integration-test-api');
const request  = require('supertest');
const App      = require('../../src/server/app');
const path     = require('path');

describe('API-TEST', () => {

    let server = null;

    const root = path.normalize(path.join(__dirname, '../..'));

    let config = { status_man_use : '../../flows/processor.js' 
        , processor_use: '../../flows/processor.js'
        , def_owner : 'opflow-dir'
        , root_dir : root
        , dist_dir : path.join(root, './dist')
        , destination: root
    };
        
    before(async () => { 
        
        const app = App(config);

        server = app;
    });    

    after( ()=> {/*server.close();*/} );
    
    
    it('should support info', async () => {
       
        let res = await request(server)
            .get('/api/list');
            
        dbg('response: ', res.status, res.body);

        expect(res.status).to.be.eq(200);
        expect(res.body.assets).to.be.an('array').that.is.not.empty;
        
        const id = res.body.assets[0].id;

        res = await request(server).get(`/api/status/${id}`);

        dbg('response: ', res.status, res.body);
        expect(res.status).to.be.eq(200, 'api status');

        expect(res.body.status).to.be.eq('ok');
        expect(res.body).to.have.property('queue_id');

        res = await request(server).get(`/api/queue/${id}`);

        dbg('response: ', res.status, res.body);
        expect(res.status).to.be.eq(200, 'api queue');

        res = await request(server).get(`/api/queue/status/${id}`);

        dbg('response: ', res.status, res.body);
        expect(res.status).to.be.eq(200, 'api queue status');

        //const queue_id = res.body.queue_id;
        
    });

    it('should support /clientaccesspolicy.xml', async ()=>{

        let res = await request(server)
            .get('/clientaccesspolicy.xml');
            
        dbg('response: ', res.status, res.body);

        expect(res.status).to.be.eq(200);
    });
    

    describe('EMPTY OWNER', () => {

        const empty_config = JSON.parse(JSON.stringify(config));
        empty_config.def_owner = 'i_do_not_exist';
        const app = App(empty_config);

        it('should support list with empty owner', async () => {
       
            const res = await request(app)
                .get('/api/list');
            
            dbg('response: ', res.status, res.body);

            expect(res.status).to.be.eq(200);
            expect(res.body.assets).to.be.an('array').that.is.empty;
        
        });
    });

});
