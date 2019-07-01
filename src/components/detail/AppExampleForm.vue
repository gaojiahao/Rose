<template>
    <div class='fill_wrapper'>
        <div class="r-fieldset">
            <template v-for="(values, index) in listValues">
                <div class="box">
                    <header>
                        <div class="vux-1px-l">实例</div>
                        <div class="basic_process_status">
                            <span class="barWrapp">
                                <i class="style-toogleBar"></i>
                            </span>
                        </div>
                    </header>
                    <div class="readOnlyPart">
                        <template v-for="(fileds, index) in listFields">
                            <div class="item">
                                <span :key="index">{{fileds.fieldName}}：</span>
                                <span >{{values[fileds.fieldCode]||'无'}}</span>
                            </div>
                        </template>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>
<script>
import Vue from 'vue'
import { XTable, LoadMore } from 'vux'
import { getListView } from "service/detailService";
import { getListViewById } from 'service/commonService'
import { getList } from 'service/listService'

var component = {
    props: {

    },
    components: {
        XTable, LoadMore
    },
    data() {
        return {
            appListId: '',
            uniqueId: '',
            listFields: [],
            transCode: '', 
            viewId: '', 
            listValues: [],
        }
    },
    methods: {
        getListView() {
            let data = {
                listId : this.appListId

            };
            return getListView(data).then(data => {
                for(let i=0; i<data.length; i++) {
                    if(data[i].isDefault == 1){
                        this.uniqueId = data[i].uniqueId;
                        break;
                    }
                }
                this.getListViewById();             
            });
        },
        getListViewById() {
            return getListViewById(this.uniqueId).then(data => {
                let content = JSON.parse(data[0].content || '{}');
                let {fields = []} = content;
                this.viewId = data[0].id;
                this.listFields = fields.filter(item => !item.isHidden);
                this.listFields.sort(function(a,b) {
                    if(a.sequence < b.sequence) {
                        return -1;
                    }
                    if(a.sequence > b.sequence) {
                        return 1;
                    }
                    return 0;
                });
                this.getList();        
            });
        },
        getList() {
            let transCode = this.$route.query.transCode;
            let arr = [];
            for(let item of transCode) {
                arr.push(item.transCode);
            }
            arr = arr.join(',')
            let filter = [{
                property: 'transCode',
                operator: 'in',
                value: arr,
            }];
            let data = {
                _dc: Date.now(),
                filter: JSON.stringify(filter),
            }
            return getList(this.viewId,data).then(data => {
                this.listValues = data.tableContent;
            });    
        }
    },
    created () {
        this.appListId = this.$route.query.listId;
        this.transCode = this.$route.query.transCode;
        this.getListView();
    }
}
export default Vue.component('AppExampleForm',component);
</script>
<style lang='scss'>
#app {
    background: #F8F8F8FF;    
}
.fill_wrapper{
    // top: 0;
    // left: 0;
    // width: 100%;
    // height: 100%;
    // overflow: hidden;
    // position: absolute;
    background: #F8F8F8FF;
    .r-fieldset {
    color: #333;
    margin: 0.1rem;
    border-radius: 0.04rem;
    background-color: #fff;
    width: calc(100% - 0.2rem);
    .box {
        padding: 0.15rem;
        &.muti{
        padding: 0 0.15rem;
        }
    }
    }
}
.readOnlyPart {
    line-height: 0.22rem;
    font-size: 0.12rem;
    span:nth-child(2n + 1) {
        color: #aaa;
    }
    span:nth-child(2n) {
        font-weight: 400;
        font-size: 0.13rem;
    }
    .item {
        display: inline-flex;
        margin-right: 0.2rem;
    }
}
.tabs {
    display: none;
}
</style>

