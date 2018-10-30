const ffprobe_output = require('./ffprobe_output');

const duration_rx = 'Duration: (\\d\\d):(\\d\\d):(\\d\\d).(\\d\\d), start: ([\\d\\.]+), bitrate: (\\d+) kb/s';
const stream_rx = 'Stream\\s#0:(\\d+)(?:[\\(\\[](\\w+)[\\)\\]]){0,1}:\\s(Audio|Video):.*?(?:(?:,\\s(\\d+)x(\\d+))|(?:(\\d+) Hz)).*?, (?:(?:(\\d+) kb/s)|(?:stereo)|(?:.*? fps))';

const begin_config_code = `
    const file = propertyBag.input_file = config.input_file;
    //let configure next operation file probe
    propertyBag.config.args = [ file ];

    file
`;

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
    
    //streams.splice(-1, 1);

    JSON.stringify(streams, null, 4);

`;

const encode_config_code = `

        const streams = JSON.parse(propertyBag.parent.result);

        cmd_video = '-vf "scale=w=$(width):h=$(height)" -codec:v libx264 -profile:v high -level 31 -b:v $(vb)k -r 25 -g 50 -sc_threshold 0 -x264opts ratetol=0.1 -minrate $(vb)k -maxrate $(vb)k -bufsize $(vb)k'
        cmd_audio = '-b:a $(ab)k -codec:a aac -profile:a aac_low -ar 44100 -ac 2 -y'

        cmd_encode = '-i "$(file)" $(map)$(video)$(audio) "$(outputfile)"'
        const file = propertyBag.input_file;
       
        cmd_encode = cmd_encode.replace('$(file)', file);

        let audio = null;
        let video = null;

        for(let idx = 0; idx < streams.length; idx++)
        {
            const stream = streams[idx];

            if('Video' === stream.kind && null === video)
                video = stream;
            
            if('Audio' === stream.kind && null === audio)
                audio = stream;
        }

        let map = ''

        if(null !== audio)
        {
            map += '-map 0:' + audio.index;
            map += ' '

        }
        else
        {
            cmd_audio = '';
        }

        if(null !== video)
        {
            map += '-map 0:' + video.index;
            map += ' '
        }
        else
        {
            cmd_video = '';
        }

        cmd_encode = cmd_encode.replace('$(map)', map);
        cmd_encode = cmd_encode.replace('$(video)', cmd_video);
        cmd_encode = cmd_encode.replace('$(audio)', cmd_audio);
        
        cmd_encode = cmd_encode.replace('$(width)', config.width);
        cmd_encode = cmd_encode.replace('$(height)', config.height);

        

        let j = cmd_encode.split(' ');

        propertyBag.info = JSON.stringify(j);

        cmd_encode

`;


module.exports = {


    probe_parse :
    {
        root : {
            type : 'START', name : 'START', children : [
                { type : 'code', name : 'pre configuration'
                    , config : {
                        input_file : '/tmp/media/file.mp4'
                        , code : begin_config_code
                    }
                    , children : [
                        { type : 'code', name : 'run ffprobe'
                            , config : {
                                cmd : 'ffprobe'
                                , args : ['TODO: file-path']
                                , code : ` 
                        
                        propertyBag.ff_arg = '[' + config.args[0] + ']';
                                
                        \`
                           
                            

                            ${ffprobe_output}
                        \`
                        `
                            }
                            , children : [
                                {type : 'code', name : 'process streams and config'
                                    , config : { code : probe_code
                                        , duration_rx
                                        , stream_rx 
                                    }
                                    , children : [
                                        {type : 'code', name : 'preprocess 1'
                                            , config : { code : encode_config_code
                                              
                                            }
                                            , children : [
                                                {type : 'END', name : 'PACKAGE'}
                                            ]
                                        } 
                                    ]
                                }
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