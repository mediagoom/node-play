import Uploader from '../../uploader/index.js'

//window.uploader = uploader;

function selectfile(e)
{
        let files = e.files;
                    //file;



                for (var i = 0; i < files.length; i++) {
                    let file = files[i];


                    //var opt = { uiid: "div_" + new Date().getTime().toString() };
                    //file_list.append(_file_ui_template.replace('$(ID)', opt.uiid));

                    //window.uploader.add_file(file, opt);

                    //alert(file.name);
                    
                    let div = document.getElementById('info');

                     let opt = {
                               url : 'http://localhost:3000/upload'
                             , chunk_size: 500
                     };
                        let u = new Uploader(file, opt);
                            u.on('completed', () => {
                                    
                                    div.innerHTML = "done";
                            });
                            u.on('error', (err) => {div.innerHTML = err.message;});
                            u.on('progress', (n) => { div.innerHTML = "prog " + n.toString();});
                            u.start();

                    //uploaders.push(new ChunkedUploader(file, opt));



                }
        //alert(
}

window.selectfile = selectfile;
