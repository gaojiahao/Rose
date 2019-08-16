
let  scanVoice = {};
let scanAudio = new Audio("/src/assets/scan/6579.mp3");

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
