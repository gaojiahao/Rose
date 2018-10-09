import $axios from '../../news/plugins/ajax'

let taskService = {
    getUniqueid(id){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/list/getListViews',
            data:{
                listId: id,
                page: 1,
                start: 0,
                limit: 100,
            }
        })

    },
    getList(page,uniqueId) {
        return $axios.ajax ({
            url:`/H_roleplay-si/ds/extr/${uniqueId}`,
            data:{
                page: page,
                start: 0,
                limit: 10
            }
            
        });
    }

}
export default taskService