document.addEventListener('deviceready', initEvent, false);

function initEvent(){
    window.notification = cordova.plugins.notification.local;
    window.badge = cordova.plugins.notification.badge;
    window.badge.clear();
    window.notification.on('click', clickFn);
    window.DsService.onNotificationClick(function(groupId){
        console.log('router push group');
        window.router.push('/msg/group/'+ groupId);
    })
}
function clickFn(notification){
    var data = notification.data;

    if(data.listId){
        window.router.push('/user');
    }
}