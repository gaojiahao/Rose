
let  scanVoice = {};

let scanAudio = new Audio();

scanAudio.setAttribute('src',require("assets/scan/scan.mp3"));

scanVoice.success = function(){
    scanAudio.play();
    setTimeout(() => {
     scanAudio.pause();
    }, 200);
}

scanVoice.error = function(){
   scanAudio.play();
   setTimeout(() => {
    scanAudio.pause();
   }, 360);
}

export default scanVoice 
