const ffprobe_output = require('./ffprobe_output');

const duration_rx = 'Duration: (\\d\\d):(\\d\\d):(\\d\\d).(\\d\\d), start: ([\\d\\.]+), bitrate: (\\d+) kb/s';
const stream_rx = 'Stream\\s#0:(\\d+)(?:[\\(\\[](\\w+)[\\)\\]]){0,1}:\\s(Audio|Video):.*?(?:(?:,\\s(\\d+)x(\\d+))|(?:(\\d+) Hz)).*?, (?:(?:(\\d+) kb/s)|(?:stereo)|(?:.*? fps))';

const begin_config_code = `
    const file = propertyBag.input_file = config.input_file;
    propertyBag.output_dir = config.output_dir;
    //let configure next operation file probe
    propertyBag.config.args = [ file ];

    
    file
`;

const probe_code = `

          let output = propertyBag.parent.result;

          let regex_duration = new RegExp(config.duration_rx, 'g');
          let m = null;
          let kb = 0;
          let duration = 0;

            if ((m = regex_duration.exec(output)) !== null) {
                
                kb = m[6];

                const hh = new Number(m[1]);
                const mm = new Number(m[2]);
                const ss = new Number(m[3]);
                const ml = new Number(m[4]);

                duration = hh * 60 * 60;
                duration += mm * 60;
                duration += ss;

                duration += ml / 1000;


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

    propertyBag.kb = kb;
    propertyBag.duration = duration;
    propertyBag.streams = streams;

    JSON.stringify(streams, null, 4);

`;


/* eslint-disable */


const encode_config_code = `

        const parse = require('parse-spawn-args').parse;

        const streams = JSON.parse(propertyBag.parent.result);

        cmd_video = '-vf "scale=w=$(width):h=$(height)" -codec:v libx264 -profile:v high -level 31 -b:v $(video_bitrate)k -r 25 -g 50 -sc_threshold 0 -x264opts ratetol=0.1 -minrate $(video_bitrate)k -maxrate $(video_bitrate)k -bufsize $(video_bitrate)k'
        cmd_audio = '-b:a $(ab)k -codec:a aac -profile:a aac_low -ar 44100 -ac 2 -y'

        cmd_encode = '-i "$(file)" $(map)$(video)$(audio) "$(output_file)"'
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

        if(null !== video && null !== audio)
        {
            cmd_encode = cmd_encode.replace('$(video)$(audio)', '$(video) $(audio)');
        }

        cmd_encode = cmd_encode.replace('$(map)', map);
        cmd_encode = cmd_encode.replace('$(video)', cmd_video);
        cmd_encode = cmd_encode.replace('$(audio)', cmd_audio);

        cmd_encode = cmd_encode.replace('$(width)', config.width);
        cmd_encode = cmd_encode.replace('$(height)', config.height);

        cmd_encode = cmd_encode.replace(/\\$\\(video_bitrate\\)/g, config.video_bitrate);
        
        

        cmd_encode = cmd_encode.replace(/\\$\\(ab\\)/g, config.audio_bitrate);

        dbg(propertyBag.output_dir);

        const output_file = propertyBag.output_dir + '/encoded_' + config.video_bitrate + '.mp4';

        dbg(output_file);
        cmd_encode = cmd_encode.replace('$(output_file)', output_file);
       
        propertyBag.quality = { file : output_file, video_bitrate: config.video_bitrate} ;

        let j = parse(cmd_encode); 

        //propertyBag.cmd = cmd_encode;

        dbg(cmd_encode);

        propertyBag.config.args = j;

        cmd_encode

`;

const images_config_code = `

    const parse = require('parse-spawn-args').parse;

    let fps = '1/10';

    if(propertyBag.duration < 50)
        fps = '1/5';
    
    if(propertyBag.duration < 15)
        fps = '1';
    
    if(propertyBag.duration < 5)
        fps = '2';
    
    if(propertyBag.duration < 2)
        fps = '10';

    let cmd_images = '-t 100 -i "$(file)" -vf fps=$(fps) "$(dir)/img%03d.jpg"'

    const file = propertyBag.input_file;
    
    cmd_images = cmd_images.replace('$(fps)', fps);
    cmd_images = cmd_images.replace('$(file)', file);
    cmd_images = cmd_images.replace('$(dir)', propertyBag.output_dir);

    let j = parse(cmd_images);//cmd_images.split(' ');
    dbg(cmd_images);

    propertyBag.config.args = j;

    cmd_images
`;

const package_config_code = `

    const quality = propertyBag.quality;
    let args = [];
    args.push('-k:adaptive');
    args.push('-o:' + propertyBag.output_dir + '/STATIC');
    let first   = true;
    let cmd_line = '';

    for(let i = 0; i < quality.length; i++){
        if(null != quality[i].file){

            if(first){
                cmd_line += '-i:';
            }
            else{
                cmd_line += '-j:';
            }

            cmd_line += quality[i].file;
            
            args.push(cmd_line);
            cmd_line = '';

            args.push('-b:' + quality[i].video_bitrate);
            
            if(first){
                args.push('-s:0');
                args.push('-e:0');
            }
        
            first = false;
        }
    }

    propertyBag.config.args = args;

    JSON.stringify(args);

`;

/* eslint-enable */

function generate_config_encode(name, height, bitrate, end)
{
    const ops =
    {type : 'code', 'name' : ('CONFIGURE ') + name, config : {code : encode_config_code, height,  width: (height / 9 * 16), video_bitrate : bitrate, audio_bitrate: 128}
        , children : [ {type : 'code', 'name' : ('ENCODE ') + name, config : {cmd : 'ffmpeg', args : [], code : `
            
            if(config.args == null){
                 throw new Error('null args');
            }

            if(config.args.length === 0){
                throw new Error('0 args');
            }

            if(/$(video_bitrate)/.test(propertyBag.parent.result))
            {
                throw new Error('no video bitrate set');
            }
                 
            JSON.stringify(config.args) 
            ` }
        , target_type : 'execute'
        , children : [{ type : 'JOIN', name : 'AFTER ENCODING'}]
        }]
    };

    if(undefined !== end)
    {
        ops.children[0].children[0].children =  end;//[{type : 'END', name : 'PACKAGE'}];
    }

    return JSON.parse(JSON.stringify(ops));
                                        
}


module.exports = {


    probe_parse :
    {
        root : {
            type : 'START', name : 'START', children : [
                { type : 'code', name : 'pre configuration'
                    , config : {
                        input_file : '/tmp/media/file.mp4'
                        , output_dir : '/tmp'
                        , code : begin_config_code
                    }
                    , children : [
                        { type : 'code', name : 'run ffprobe'
                            , config : {
                                cmd : 'ffprobe'
                                , args : ['TODO: file-path']
                                , include_err: true
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
                                                , width : 1280
                                                , height : 720
                                                , video_bitrate : 3500
                                                , audio_bitrate : 128 
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
                { type : 'code', name : 'pre configuration'
                    , config : {
                        input_file : '/tmp/media/file.mp4'
                        , output_dir : 'C:/tmp'
                        , code : begin_config_code
                    }
                    , children : [
                        { type : 'code', name : 'run ffprobe', target_type : 'execute'
                            , config : {
                                cmd : 'ffprobe'
                                , args : ['this is configured by the previous operation']
                                , include_err : true
                                , code : ` \`${ffprobe_output}\` ` 
                            }
                            , children : [
                                {type : 'code', name : 'process streams and config'
                                    , config : { code : probe_code
                                        , duration_rx
                                        , stream_rx 
                                    }
                                    , children : [
                                        { type : 'code', name : 'configure ffmpeg images'
                                            , config : {
                                                code : images_config_code 
                                            }
                                            , children : [{ type : 'code', name : 'run ffmpeg images', target_type : 'execute'
                                                , config : {
                                                    cmd : 'ffmpeg'
                                                    , args : []
                                                    , code : ' "this is the ffmpeg image return" '
                                                }
                                                , children : [
                                                    {type : 'JOIN', name : 'AFTER-IMAGES' , children : [
                                                        {type : 'END', name : 'FINISH'}
                                                    ]}
                                                ] 
                                            }]}
                                        , generate_config_encode('GEN-1', 144, 120,  [
                                            { type : 'code', name : 'CONFIGURE PACKAGE', config : { code : package_config_code}, target_type : 'code'
                                                , children : [
                                                    {type: 'code', name : 'MG PACKAGE', config: {cmd : 'mg', args : [], code : '"MG"'}, target_type : 'execute'
                                                        , children : [
                                                            {type : 'JOIN', name : 'AFTER-IMAGES'
                                                            }
                                                
                                                        ]}
                                                ]}
                                        ])        
                                        , generate_config_encode('GEN-2', 288, 320) 
                                        , generate_config_encode('GEN-3', 576, 750) 
                                        , generate_config_encode('GEN-4', 720, 1200)
                                        , generate_config_encode('GEN-5', 720, 2000) 
                                        , generate_config_encode('GEN-6', 720, 3500)
                                    ]
                                }
                                
                            ]
                        }
                    ]}
            ]
        }
    }
};