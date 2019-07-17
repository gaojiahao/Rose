<template>
    <div class='app_example_fill_wrapper' v-show="showTab">
        <div class="fieldSets">
            <div class="r-fieldset">
                <div class="box">
                    <header>
                        <div class="vux-1px-l">{{this.tabData.listName}}</div>
                    </header>
                </div>
            </div>
            <template v-for="(values, index) in listValues">
                <div class="r-fieldset">
                    <div class="box">
                        <div class="readOnlyPart">
                            <template v-for="(fileds, index) in listFields">
                                <div class="item">
                                    <span :key="index">{{fileds.fieldName}}：</span>
                                    <span :class="{atvice:fileds.fieldCode == 'transCode'}" v-if="fileds.fieldCode == 'transCode'" @click="goDetail(values[fileds.fieldCode])">{{values[fileds.fieldCode]||'无'}}</span>
                                    <span v-else>{{values[fileds.fieldCode]||'无'}}</span>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>
<script>
import Vue from 'vue'
import { getListView } from "service/detailService";
import { getListViewById } from 'service/commonService'
import { getList } from 'service/listService'

var component = {
    props: {
        showTab : {
            type: Boolean,
            default: false,
        },
        tabData: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    components: {
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
    watch: {
        tabData: {
            handler(val) {
                this.transCode = val.content;
                this.appListId = val.listId;
                if(this.transCode) {
                    this.getListView();
                }
            }
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
            let transCode = this.transCode;
            let arr = [];
            for(let item of transCode) {
                arr.push(item.transCode);
            }
            arr = arr.join(',');
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
        },
        //跳转到相应的交易号详情
        goDetail(transCode) {
            if(transCode) {
                let listId = this.tabData.listId;
                let path = `/detail/${listId}/0`;
                this.$router.push({
                    path: path,
                    query: {
                        name: 'null',
                        folder: 'null',
                        fileName: 'null',
                        transCode: transCode,
                    }
                });
            }
        },
    },
    created () {
        
    }
}
export default Vue.component('AppExample',component);
</script>
<style lang='scss'>
#app {
    background: #F8F8F8FF;    
}
.app_example_fill_wrapper   {
    .fieldSets {
        background: #F8F8F8FF;
        .r-fieldset {
            color: #333;
            margin: 0 0.1rem 0.1rem;
            border-radius: 0.04rem;
            background-color: #fff;
            width: calc(100% - 0.2rem);
            .box {
                padding: 0.15rem;
                &.muti{
                    padding: 0 0.15rem;
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
                        .atvice {
                            color: #3296fa;
                        }
                    }
                }
            }
        }
    }
}
.tabs {
    display: none;
}
</style>

