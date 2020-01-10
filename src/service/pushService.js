document.addEventListener('deviceready', initEvent, false);

function initEvent(){
    window.notification = cordova.plugins.notification.local;
    window.badge = cordova.plugins.notification.badge;
    window.badge.clear();
}