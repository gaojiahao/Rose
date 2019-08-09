import $flyio from 'plugins/ajax'
let homeService = {
    getMenu() {
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
    },
    //搜索菜单
    getMenuLeafAndTaskByText(data = {}) {
        return $flyio.ajax({
            type: 'GET',
            contentType: 'application/x-www-form-urlencoded',
            url: '/H_roleplay-si/ds/getMenuLeafAndTaskByText',
            data: data
        })
    }

}
export default homeService