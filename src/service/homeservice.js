import $flyio from 'plugins/ajax'
let currentUser;
let homeService = {
    getMeau() {
        return $flyio.ajax({
            url:'/H_roleplay-si/ds/getMenu'
        })

    },
    getMyTask() {
        return $flyio.ajax({
            url:'/H_roleplay-si/ds/getMyTaskCountAll'
        })

    },
    //获取当前用户
    currentUser() {
        return new Promise((resolve, reject)=>{
            if(currentUser == null){
                $flyio.ajax({
                    url:'/H_roleplay-si/userInfo/currentUser'
                }).then(function(data){
                    currentUser = data;
                    resolve(currentUser);
                })
            } else {
                resolve(currentUser);
            }
        })
    },
    //切换主体
    changeEntity(data = {}) {
        return $flyio.ajax({
            type: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            url: '/H_roleplay-si/changeEntity',
            data: data
          })
    }
}
export default homeService