import $axios from '../plugins/ajax'
let homeService = {
    getMeau(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getMenu?_dc=1531978945753'
        })

    },
    getMyTask(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getMyTaskCountAll'
        })

    }
}
export default homeService