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

    }
}
export default homeService