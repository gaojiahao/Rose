import $axios from '../plugins/ajax'
import errHandle from './errHandle'

let homeService = {
    getMeau(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getMenu?_dc=1531978945753'
        }).catch(e => {
            return errHandle(e);
        });

    },
    getMyTask(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getMyTaskCountAll'
        }).catch(e => {
         return errHandle(e);
        });

    },
    //获取当前用户
    currentUser(){
        return $axios.ajax({
            url:'/H_roleplay-si/userInfo/currentUser'
        }).catch(e => {
            return errHandle(e);
        });
    },
    //切换主体
    changeEntity(data = {}){
        return $axios.ajax({
            type: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            url: '/H_roleplay-si/changeEntity',
            data: data
          }).catch(e => {
            return errHandle(e);
          });
    }
}
export default homeService