import $flyio from 'plugins/ajax'
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