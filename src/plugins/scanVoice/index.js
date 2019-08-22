
let  scanVoice = {};

let scanAudioSuccess = new Audio();
let scanAudioError = new Audio();

scanAudioSuccess.setAttribute('src',require("assets/scan/scanSuccess.mp3"));
scanAudioError.setAttribute('src',require("assets/scan/scanError.mp3"));

scanVoice.success = function(){
    scanAudioSuccess.play();
    setTimeout(() => {
        scanAudioSuccess.pause();
    }, 500);
}

scanVoice.error = function(){
    scanAudioError.play();
   setTimeout(() => {
    scanAudioError.pause();
   }, 350);
}

export default scanVoice 
