import { EventEmitter } from 'events';
import httprequest from '../../core/httprequest';


/**
* Utility method to format bytes into the most logical magnitude (KB, MB,
* or GB).
*/
function formatBytes(number) {
        var units = ['B', 'KB', 'MB', 'GB', 'TB'],
            //bytes = this,
            i;

        for (i = 0; bytes >= 1024 && i < 4; i++) {
            bytes /= 1024;
        }

        return bytes.toFixed(2) + units[i];
}

class Uploader extends EventEmitter {
  constructor() {
    super();
    this.wallet = 0;
  }



}


module.exports = function ()
{
        alert('uploader.02');

}
