import $axios from '../plugins/ajax'

let homeService = {
    getMeau(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getMenu'
        })

    },
    getMyTask(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getMyTaskCountAll'
        })

    },
    //获取当前用户
    currentUser(){
        return $axios.ajax({
            url:'/H_roleplay-si/userInfo/currentUser'
        })
    },
    //切换主体
    changeEntity(data = {}){
        return $axios.ajax({
            type: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            url: '/H_roleplay-si/changeEntity',
            data: data
          })
    }
}
export default homeService