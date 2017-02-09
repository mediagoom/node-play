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
            return this._content.slice(start, end);
    }

    
}
