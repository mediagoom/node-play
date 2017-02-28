import fs from 'fs'
import path from 'path'

export default class TestFile
{
    constructor(filepath)
    {
         this._content = fs.readFileSync(filepath);
         this.size = this._content.length;
         this.name = path.basename(filepath);
    }

    slice(start, end)
    {
            let n = this._content.slice(start, end);
            
            //console.log('***>' , (typeof n), n.constructor.name);

            return n;
    }

    
}
