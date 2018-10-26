module.exports = {
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
};