const path = require('path'),
      readline = require('readline'),
      fs = require('fs'),
      file = path.resolve(__dirname,'../src/assets/iconfont/iconfont.css');

const rb = readline.createInterface({
    input:fs.createReadStream(file)
})
var  arr = [];
rb.on('line',line=>{
    var key;
    if (line.startsWith('.icon-')){
       key = line.substr(1,line.indexOf(':befor')-1);
       console.log("'"+key+"',");
    }
})