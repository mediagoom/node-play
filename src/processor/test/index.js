import chai from "chai";
import Processor from "../../processor/index.js";
import cp   from "child_process";
import path from "path";

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

var result = [ { index: "0"
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

 
describe("PROCESSOR", () => {

    describe("Process Streams", () => {
        
        let cases = [
            { name : "flv"
              , input : `
    Duration: 00:01:54.66, start: 0.000000, bitrate: 962 kb/s
    Stream #0:0: Video: h264 (High), yuv420p, 640x352 [SAR 44:45 DAR 16:9], 30.30 fps, 29.97 tbr, 1k tbn, 59.94 tbc
    Stream #0:1: Audio: aac (HE-AAC), 44100 Hz, stereo, fltp

                
                `
              , expected : [{ index: "0"
                                   ,  lang: "und"
                                   ,  kind: "Video"
                                   ,  width: "640"
                                   ,  height: "352"
                                   ,  kz: undefined
                                   ,  bps: "962" }
                                  , { index: "1"
                                    , lang: "und"
                                    , kind: "Audio"
                                    , width: undefined
                                    , height: undefined
                                    , kz: "44100"
                                    , bps: undefined } 

              ]
            }
            , { name : "mp4"
                , input : `
 Duration: 00:02:59.84, start: 0.080000, bitrate: 777 kb/s
   Stream #0:0(und): Video: h264 (High) (avc1 / 0x31637661), yuv420p, 1024x576 [SAR 1:1 DAR 16:9], 674 kb/s, 25 fps, 25 tbr, 12800 tbn, 50 tbc (default)
   Metadata:
     creation_time   : 2016-11-28T16:36:40.000000Z
     handler_name    : FOUNDATION MEDIA HANDLER
   Stream #0:1(und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, 5.1, fltp, 96 kb/s (default)
   Metadata:
     creation_time   : 2016-11-28T16:36:40.000000Z
     handler_name    : FOUNDATION MEDIA HANDLER
`
            , expected : result
            }

            , {name : "hdtv.ts"
                , input : `
Input #0, mpegts, from 'F:\\IOMEGA\\NEWMEDIA\\MORE\\2\\hdtv.ts':
  Duration: 00:01:00.35, start: 50685.124933, bitrate: 14138 kb/s
  Program 1
    Stream #0:0[0x101]: Video: mpeg2video ([2][0][0][0] / 0x0002), none(tv), 90k tbr, 90k tbn, 90k tbc
    Stream #0:1[0x800]: Video: mpeg2video (Main) ([2][0][0][0] / 0x0002), yuv420p(tv, bt709), 1920x1080 [SAR 1:1 DAR 16:9], 29.97 fps, 29.97 tbr, 90k tbn, 59.94 tbc
    Stream #0:2[0x801](eng): Audio: ac3 ([129][0][0][0] / 0x0081), 48000 Hz, 5.1(side), fltp, 384 kb/s
    Stream #0:3[0x102]: Audio: ac3 ([129][0][0][0] / 0x0081), 0 channels, fltp
`                    
        , expected : [{ index: "0"
                                   ,  lang: "und"
                                   ,  kind: "Video"
                                   ,  width: "1920"
                                   ,  height: "1080"
                                   ,  kz: undefined
                                   ,  bps: "14138" }
                                  , { index: "1"
                                    , lang: "eng"
                                    , kind: "Audio"
                                    , width: undefined
                                    , height: undefined
                                    , kz: "48000"
                                    , bps: undefined } 

        ]
                , enabled : false

            }
        ];

        let output_stream = ` 
  Output #0, image2, to :
 ......
    Stream #0:0: Video: mjpeg, yuvj420p(pc), 640x352 [SAR 44:45 DAR 16:9], q=2-31, 200 kb/s, 0.10 fps, 0.10 tbn, 0.10 tbc
  `;

        for(let i = 0; i < cases.length; i++)
        {
            let name = "get_streams_cases_" + i + "_" + cases[i].name;

            if(cases[i].enabled || undefined == cases[i].enabled)
            {
           // console.log(name);
                it(name, () => {
                    let p    = new Processor(name);
                    let s    = p.get_streams(cases[i].input + output_stream);

                    // console.log(s.streams);
                    // console.log(cases[i].expected);

                    expect(s.streams).to.be.deep.equal(cases[i].expected);

                });
            }
        }

    });

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
        let tid  = tval("TESTID"  , "9999999999_" + n);

        let p    = new Processor(n, {destination: "./uploader", id : tid});
        let file = tval("TESTMEDIAFILE", "./src/processor/test/MEDIA1.MP4");

        let dir  = path.resolve(path.join(p.options.destination, p.get_full_name()));

        

        let quality = [   { audiobitrate: 96
            , videobitrate: 120
            , height: 144
            , width: "256"
            , done: true
            , file: path.join(dir, "TEST_256_144_120.mp4").replace(/\\/g, "/") }
        , { audiobitrate: 96
            , videobitrate: 320
            , height: 288
            , width: "512"
            , done: true
            , file: path.join(dir, "TEST_512_288_320.mp4").replace(/\\/g, "/") }
        , { audiobitrate: 96
            , videobitrate: 750
            , height: 576
            , width: "1024"
            , done: true
            , file: path.join(dir, "TEST_1024_576_750.mp4").replace(/\\/g, "/") }
                          , { videobitrate: 0, height: 720, width: "1280", done: true }
                          , { videobitrate: 0, height: 720, width: "1280", done: true }
                          , { videobitrate: 0, height: 720, width: "1280", done: true } 
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



        it("encode", (done) => {
            
            expect(result.length).to.be.equal(2);

            p.encode(file, result).then((rquality) => {
                
                check(done, () => {

                    expect(rquality).to.be.deep.equal(quality);
                });
            }
            , (err) => { done(err); }
            );
                

        });

        it("package", (/*done*/) => {
            
            //expect(quality).to.be.a("Array(6)");

            return p.package(quality, "STATIC");
                

        });

    });

});
