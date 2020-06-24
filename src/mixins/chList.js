import { getView, getViewList, getListClassfiy } from 'service/kmService'

export default {
    data() {
        return {
            listView: [],
            activeIndex: 1,
        }
    },
    methods: {
        //获取列表视图
        getClassfiy() {
            return getListClassfiy({account_code: this.uniqueId,device_type : 'phone'}).then(({data = []}) => {
                let [first = {}] = data;
                this.listView = data;
                this.activeTab = first.view_name;
                this.calc_rel_code = first.calc_rel_code;
                this.view_id = first.view_id;
            })
        },
    },
    created() {
        this.getClassfiy();

    }
}