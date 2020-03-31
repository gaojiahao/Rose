document.addEventListener('deviceready', initEvent, false);

function initEvent(){
    window.notification = cordova.plugins.notification.local;
    window.badge = cordova.plugins.notification.badge;
    window.badge.clear();
    window.notification.on('click', clickFn);
}
function clickFn(notification){
    var data = notification.data;
    console.log(data);
    if(data.listId){
        window.router.push('/user');
    }
}