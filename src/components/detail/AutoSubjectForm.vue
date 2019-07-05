<template>
    <div class='fill_wrapper'>
        <div class="tabSets">
            <tab :line-width=2 active-color='#3296fa' v-model="index">
                <tab-item class="vux-center" :selected="changeTab === item" v-for="(item, index) in list" @click="changeTab = item" :key="index">{{item}}</tab-item>
            </tab>
            <swiper v-model="index" height="100px" :show-dots="false">
                <!-- <swiper-item v-for="(item, index) in list" :key="index">
                    <div class="tab-swiper vux-center">{{item}} Container</div>
                </swiper-item> -->
                <swiper-item>
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
                    </div>
                </swiper-item>
                <swiper-item>
                    <div class="tab-swiper vux-center">22</div>       
                </swiper-item>
            </swiper>
        </div>
        <!-- <div class="fieldSets">
             <div class="r-fieldset">
                <div class="box">
                    <header>
                        <div class="vux-1px-l">会计科目</div>
                        <div class="basic_process_status">
                            <span class="barWrapp">
                                <i class="style-toogleBar"></i>
                            </span>
                        </div>
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
        </div> -->
    </div>
</template>
<script>
import Vue from 'vue'
import { Tab, TabItem, Swiper, SwiperItem } from 'vux'
import { getView } from 'service/kmService'

var component = {
    components: {
        Tab,TabItem,Swiper,SwiperItem
    },
    data () {
        return {
            list: ["财务会计","管理会计"],
            index: 0,
            changeTab: '财务会计',

        }
    },
    methods: {
        getView() {
            let data = {
                _dc: Date.now(),
                view_id: view_id,
                active_type: 'automatic',
                trans_code: transCode,
                view_scope: 'modelAndData',
                op: 'queryAll',
                view_type: view_type
            }
            return getView(data).then(data => {
                this.listValues = data.tableContent;
            });    
        },    
    },
    created () {

    }    
}
export default Vue.component('AutoSubjectForm',component);
</script>
<style lang='scss'>
#app {
    background: #F8F8F8FF;    
}
.tabSets {
    padding: 0.1rem;
}
.fill_wrapper   {
    .fieldSets {
        margin-top: .1rem;
        background: #F8F8F8FF;
        .r-fieldset {
            color: #333;
            margin: 0 0 0.1rem 0;
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