<template>
    <div class='auto_subject_fill_wrapper' v-show="showTab">
        <div class="tabSets">
            <tab :line-width=2 active-color='#3296fa' v-model="index">
                <tab-item class="vux-center" :selected="changeTab===item" v-for="(item, index) in list" @on-item-click="onChangeTab(item)" :key="index">{{item}}</tab-item>
            </tab>
            <div class="fieldSets">
                <div class="r-fieldset">
                    <div class="box">
                        <header>
                            <div class="vux-1px-l">会计科目</div>
                        </header>
                    </div>
                </div>
                <div class="r-fieldset" v-for="(value, index) in financeData.data">
                    <div class="box">
                        <div class="readOnlyPart">
                            <template v-for="(item, index) in financeModel.model">
                                <div class="item" :key= index v-if="!item.hidden">
                                    <span>{{item.text}}</span>
                                    <span>{{value[item.field]}}</span>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
                <div class="r-fieldset" v-if="changeTab==='管理会计'">
                    <div style="padding:0.15rem 0.15rem 0rem 0.15rem;">合计</div>
                    <div class="box">
                        <div class="readOnlyPart" >
                            <template v-for="(item, index) in financeModel.model">
                                <div class="item" :key= index v-if='financeDataTotal[item.field]>=0'>
                                    <template>
                                        <span>{{item.text}}</span>
                                        <span>{{financeDataTotal[item.field]||'-'}}</span>
                                    </template>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
                <div class="r-fieldset">
                    <div class="box">
                        <header>
                            <div class="vux-1px-l">非会计科目</div>
                        </header>
                    </div>
                </div>
                <div class="r-fieldset" v-for="(value, index) in manageData.data">
                    <div class="box">
                        <div class="readOnlyPart">
                            <template v-for="(item, index) in manageModel.model">
                                <div class="item" :key= index v-if="!item.hidden">
                                    <span>{{item.text}}</span>
                                    <span>{{value[item.field]}}</span>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
                <div class="r-fieldset">
                    <div style="padding:0.15rem 0.15rem 0rem 0.15rem;">合计</div>
                    <div class="box">
                        <div class="readOnlyPart" >
                            <template v-for="(item, index) in manageModel.model">
                                <div class="item" :key= index v-if='manageDataTotal[item.field]>=0'>
                                    <template>
                                        <span>{{item.text}}</span>
                                        <span>{{manageDataTotal[item.field]||'-'}}</span>
                                    </template>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Vue from 'vue'
import { Tab, TabItem, Swiper, SwiperItem } from 'vux'
import { getView } from 'service/kmService'
import { accAdd, accDiv } from "plugins/calc/decimalsAdd"

var component = {
    props: {
        showTab : {
            type: Boolean,
            default: false,
        }
    },
    components: {
        Tab,TabItem,Swiper,SwiperItem
    },
    data () {
        return {
            list: ["财务会计","管理会计"],
            index: 0,
            changeTab: '财务会计',
            transCode: '',
            view_id: 'view_13',
            view_type: '',
            financeModel: {},
            financeData: {},//财务会计数据包
            manageModel: {},
            manageData: {},//管理会计数据包
            manageDataTotal:{},
            financeDataTotal:{},
        }
    },
    watch: {
        showTab: {
            handler(val) {
                if(val) {
                    this.getAccount();
                }
            }
        }
    },
    methods: {
        onChangeTab(item) {
            this.changeTab = item;
            this.getAccount();
        },
        async getAccount() {
            let view_id = '';
    
            let data1 = {
                _dc: Date.now(),
                view_id: 'view_3',
                active_type: 'automatic',
                trans_code: this.transCode,
                view_scope: 'model',
                op: 'queryAll',
                view_type: this.view_type
            }
            let data2 = {
                _dc: Date.now(),
                view_id: 'view_3',
                active_type: 'automatic',
                trans_code: this.transCode,
                view_scope: 'data',
                op: 'queryAll',
                view_type: this.view_type    
            }
            let data3 = {
                _dc: Date.now(),
                view_id: 'view_13',
                active_type: 'automatic',
                trans_code: this.transCode,
                view_scope: 'model',
                op: 'queryAll',
                view_type: this.view_type    
            }
            let data4 = {
                _dc: Date.now(),
                view_id: 'view_13',
                active_type: 'automatic',
                trans_code: this.transCode,
                view_scope: 'data',
                op: 'queryAll',
                view_type: this.view_type    
            }

            if(this.changeTab=='财务会计') {
                this.financeModel = await this.getView(data1);
                this.financeData = await this.getView(data2);
                this.manageModel = await this.getView(data3); 
                this.manageData = await this.getView(data4);
                this.manageDataTotal = this.dealTotal(this.manageData.data);
                console.log(this.manageDataTotal);
            } else {
                data1.view_id = 'view_managerAccountAutomaticEntry';
                data1.active_type = 'automatic';
                data2.view_id = 'view_managerAccountAutomaticEntry';
                data2.active_type = 'automatic';

                this.financeModel = await this.getView(data1);
                this.financeData = await this.getView(data2);
                this.financeDataTotal = this.dealTotal(this.financeData.data);
                console.log(this.financeDataTotal);
            }
        },
        dealTotal(arr){
            var totalObj={
                debitAmount:0,
                debitQty:0,
                creditAmount:0,
                creditQty:0,
            };

            for(var i=0;i<arr.length;i++){
                if(arr[i].debitAmount&&!this.regArr(arr[i].debitAmount)){
                    totalObj.debitAmount = accAdd(totalObj.debitAmount,arr[i].debitAmount);
                }
                if(arr[i].debitQty&&!this.regArr(arr[i].debitQty)){
                    totalObj.debitQty = accAdd(totalObj.debitQty,arr[i].debitQty);
                }
                if(arr[i].creditAmount&&!this.regArr(arr[i].creditAmount)){
                    totalObj.creditAmount = accAdd(totalObj.creditAmount,arr[i].creditAmount);
                }
                if(arr[i].creditQty&&!this.regArr(arr[i].creditQty)){
                    totalObj.creditQty = accAdd(totalObj.creditQty,arr[i].creditQty);
                }
            }
            return totalObj;  
        },
        dealTotal2(arr){
            var totalObj={
                crOriginalCurrencyAmount:0,  //借方原币金额
                crStandardCurrencyAmount:0,  //贷方原币金额
                drOriginalCurrencyAmount:0,  //借方本位币金额
                drStandardCurrencyAmount:0,  //贷方本位币金额
            };

            for(var i=0;i<arr.length;i++){
                if(arr[i].crOriginalCurrencyAmount&&!this.regArr(arr[i].debitAmount)){
                    totalObj.crOriginalCurrencyAmount = accAdd(totalObj.crOriginalCurrencyAmount,arr[i].crOriginalCurrencyAmount);
                }
                if(arr[i].crStandardCurrencyAmount&&!this.regArr(arr[i].debitAmount)){
                    totalObj.crStandardCurrencyAmount = accAdd(totalObj.crStandardCurrencyAmount,arr[i].crStandardCurrencyAmount);
                }
                if(arr[i].drOriginalCurrencyAmount&&!this.regArr(arr[i].debitAmount)){
                    totalObj.drOriginalCurrencyAmount = accAdd(totalObj.drOriginalCurrencyAmount,arr[i].drOriginalCurrencyAmount);
                }
                if(arr[i].drStandardCurrencyAmount&&!this.regArr(arr[i].debitAmount)){
                    totalObj.drStandardCurrencyAmount = accAdd(totalObj.drStandardCurrencyAmount,arr[i].drStandardCurrencyAmount);
                }
            }
            return totalObj;  
        },
        regArr(arr){
            var reg="^[-]+$";
            var regus = new RegExp(reg);

            return regus.test(arr) 

        },
        getView(data) {
            return getView(data);
        },
    },
    created () {
        this.transCode = this.$route.query.transCode;
        // this.getAccount();
    }    
}
export default Vue.component('AutoSubject',component);
</script>
<style lang='scss'>
.auto_subject_fill_wrapper  {
    .fieldSets {
        background: #F8F8F8FF;
        .r-fieldset {
            color: #333;
            border-radius: 0.04rem;
            background-color: #fff;
            width: 100%;
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
                        margin-left: .1rem;
                    }
                    .item {
                        display: inline-flex;
                        margin-right: 0.2rem;
                    }
                }
            }
        }
    }
}
.tabs {
    // display: none;
}
</style>