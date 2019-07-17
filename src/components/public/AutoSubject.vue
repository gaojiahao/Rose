<template>
    <div class='auto_subject_fill_wrapper' v-show="showTab">
        <div class="tabSets">
            <tab :line-width=2 active-color='#3296fa' v-model="index">
                <tab-item class="vux-center" :selected="changeTab === item" v-for="(item, index) in list" @click="changeTab = item" :key="index">{{item}}</tab-item>
            </tab>
            <div class="fieldSets">
                <div class="r-fieldset">
                    <div class="box">
                        <header>
                            <div class="vux-1px-l">会计科目</div>
                        </header>
                    </div>
                </div>
                <div class="r-fieldset">
                    <div class="box">
                        <div class="readOnlyPart">
                            <div class="item">
                                <span>111</span>
                                <span>222</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="r-fieldset">
                    <div class="box">
                        <div class="readOnlyPart">
                            <div class="item">
                                <span>111</span>
                                <span>222</span>
                            </div>
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
                <div class="r-fieldset">
                    <div class="box">
                        <div class="readOnlyPart">
                            <div class="item">
                                <span>444</span>
                                <span>555</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="r-fieldset">
                    <div class="box">
                        <div class="readOnlyPart">
                            <div class="item">
                                <span>666</span>
                                <span>777</span>
                            </div>
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
            financeAccountData: {

            },//财务会计数据包
            manageAccountData: {

            }//管理会计数据包
        }
    },
    methods: {
        getAccount() {
            let view_id = '';
            if(this.changeTab=='财务会计') {
                view_id = 'view_3'; 
            } else {
                view_id = 'view_13';     
            }
            let data = {
                _dc: Date.now(),
                view_id: view_id,
                active_type: 'automatic',
                trans_code: this.transCode,
                view_scope: 'model',
                op: 'queryAll',
                view_type: this.view_type
            }
            this.getView(data);    
        },
        getView(data) {
            return getView(data).then(data => {
               // console.log(data);
            });
        },  
    },
    created () {
        this.transCode = this.$route.query.transCode;
        this.getAccount();
    }    
}
export default Vue.component('AutoSubject',component);
</script>
<style lang='scss'>
// #app {
//     background: #F8F8F8FF;    
// }
// .tabSets {
//     padding: 0.1rem;
// }
.auto_subject_fill_wrapper   {
    .fieldSets {
        background: #F8F8F8FF;
        .r-fieldset {
            color: #333;
            // margin: 0 0 0.1rem 0;
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
    display: none;
}
</style>