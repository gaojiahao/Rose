document.addEventListener('deviceready', initEvent, false);

function initEvent(){
    window.notification = cordova.plugins.notification.local;
    window.badge = cordova.plugins.notification.badge;
    window.badge.clear();
    window.notification.on('click', clickFn);
    window.DsService.onNotificationClick(function(groupId){
        window.router.push('/msg/group/'+ groupId);
    })
}
function clickFn(notification){
    var data = notification.data;

    if(data && data.listId){
        window.router.push('/user');
    } else if(data && data.groupId){
        window.router.push('/msg/group/'+ data.groupId);
    }
}