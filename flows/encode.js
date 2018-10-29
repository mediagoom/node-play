
const duration_rx = 'Duration: (\\d\\d):(\\d\\d):(\\d\\d).(\\d\\d), start: ([\\d\\.]+), bitrate: (\\d+) kb/s';
const stream_rx = 'Stream\\s#0:(\\d+)(?:[\\(\\[](\\w+)[\\)\\]]){0,1}:\\s(Audio|Video):.*?(?:(?:,\\s(\\d+)x(\\d+))|(?:(\\d+) Hz)).*?, (?:(?:(\\d+) kb/s)|(?:stereo)|(?:.*? fps))';
           
const probe_code = `
          let output = propertyBag.parent.result;

          let regexpd = new RegExp(config.duration_rx, 'g');
          let m = null;
            let kb = 0;

            if ((m = regexpd.exec(output)) !== null) {
                
                kb = m[6];

            }

           let regexp = new RegExp(config.stream_rx, 'g');

           const streams = [];
        
        while ((m = regexp.exec(output)) !== null) {
            let s = { index : m[1]
                , lang  : m[2]
                , kind  : m[3]
                , width : m[4]
                , height: m[5]
                , kz    : m[6]
                , bps   : m[7]
            };

            if(s.kind == 'Video' && s.bps == null)
                s.bps = kb;

            if(s.lang == null)
                s.lang = 'und';

            streams.push(s);

        }
    
    streams.splice(-1, 1);

    JSON.stringify(streams, null, 4);

`;


module.exports = {


    probe_parse :
    {
        root : {
            type : 'START', name : 'START', children : [
                { type : 'code', name : 'run ffprobe'
                    , config : {
                        cmd : 'ffprobe'
                        , args : 'TODO: file-path'
                        , code : ' "this is the ffprobe return" '
                    }
                    , children : [
                        {type : 'code', name : 'process streams and config', config : { code : ' "do code processing pre encoding" '}
                            , children : [
                                {type : 'END', name : 'PACKAGE'}
                            ]
                        }
                    ]
                }
            ]
        }
    }


    , encode : {
        root : {
            type : 'START', name : 'START', children : [
                { type : 'code', name : 'run ffprobe'
                    , config : {
                        cmd : 'ffprobe'
                        , args : 'TODO: file-path'
                        , code : ' "this is the ffprobe return" '
                    }
                    , children : [
                        {type : 'JOIN', name : 'AFTER-IMAGES'
                            , children : [
                                {type : 'code', name : 'process streams and config', config : { code : ' "do code processing pre encoding" '}
                                    , children : [
                                        {type : 'code', name: 'ENCODE QUALITY 1', config : {code : ' "ENC Q1"'}
                                            , children : [
                                                { type : 'JOIN', name : 'AFTER ENCODING'
                                                    , children : [
                                                        {type : 'END', name : 'PACKAGE'}
                                                    ]
                                                }
                                            ]
                                        }
                                        , {type : 'code', name: 'ENCODE QUALITY 2', config : {code : ' "ENC Q2"'}, children : [{ type : 'JOIN', name : 'AFTER ENCODING'}]}
                                        , {type : 'code', name: 'ENCODE QUALITY 3', config : {code : ' "ENC Q3"'}, children : [{ type : 'JOIN', name : 'AFTER ENCODING'}]}
                                        , {type : 'code', name: 'ENCODE QUALITY 4', config : {code : ' "ENC Q4"'}, children : [{ type : 'JOIN', name : 'AFTER ENCODING'}]}
                                        , {type : 'code', name: 'ENCODE QUALITY 5', config : {code : ' "ENC Q5"'}, children : [{ type : 'JOIN', name : 'AFTER ENCODING'}]}
                                        , {type : 'code', name: 'ENCODE QUALITY 6', config : {code : ' "ENC Q6"'}, children : [{ type : 'JOIN', name : 'AFTER ENCODING'}]}
                                    ]

                                }
                               
                            ]    
                        }
                    ]    
                }
                , { type : 'code', name : 'run ffmpeg images'
                    , config : {
                        exec : 'ffmpeg -t 100 -i "$(file)" -vf fps=1/10 "$(dir)/img%03d.jpg"'
                        , code : ' "this is the ffmpeg image return" '
                    }
                    , children : [
                        {type : 'JOIN', name : 'AFTER-IMAGES'}
                    ] 
                }
            ]
        }
    }
};