const expect   = require('chai').expect;
const dbg      = require('debug')('node-play:integration-test-api-fail');
const request  = require('supertest');
const App      = require('../../src/server/app');



describe('API-TEST-FAIL', () => {

    let server = null;
 
    let config = {
        process_manager : '../../test/integration/fake_process_manager' 
    };
        
    before( () => { 
        
        const app = App(config);

        server = app;
    });    

    after( ()=> {/*server.close();*/} );
    
    
    it('should api fail', async () => {
       
        let res = await request(server)
            .get('/api/list');
            
        dbg('/api/list response: ', res.status, res.body);

        expect(res.status).to.be.eq(500);
        expect(res.body.msg).to.be.eq('invalid list');
        
        

        res = await request(server).get('/api/status/invalid');

        dbg('/api/status/ response: ', res.status, res.body);
        expect(res.status).to.be.eq(500, 'api status');
        expect(res.body.msg).to.be.eq('invalid status');
        
        res = await request(server).get('/api/queue/invalid');

        dbg('api/queue response: ', res.status, res.body);
        expect(res.status).to.be.eq(500, 'api queue');
        expect(res.body.msg).to.be.eq('invalid queue_operation_list');

        

        res = await request(server).get('/api/queue/status/invalid');

        dbg('/api/queue/status response: ', res.status, res.body);
        expect(res.status).to.be.eq(500, 'api queue status');
        expect(res.body.msg).to.be.eq('invalid queue_status');

        res = await request(server).get('/api/queue/redo/invalid/invalid');

        dbg('/api/queue/redo response: ', res.status, res.body);
        expect(res.status).to.be.eq(200, 'api queue redo');

        res = await request(server).get('/api/upload/test_name');
       
        dbg('/api/upload response: ', res.status, res.body);
        expect(res.status).to.be.eq(500, 'api upload name');
        expect(res.body.msg).to.be.eq('invalid reserve_name');


        //const queue_id = res.body.queue_id;
        
    });

   
});
