<template>
    <div>
        <transition name="slide-fade">
            <div class="side-content" v-show="show && transCode">
                <div class="side-content-wrap">
                    <div class="box" @click="goDetail"><span><img src='../../assets/slideBar-home.png'></span><span>基本信息</span></div>
                    <!-- <div class="box" ><span><img src='../../assets/slideBar-history.png'></span><span>变更历史</span></div> -->
                    <div class="box" @click="autoSubject">
                        <span><img src='../../assets/view-subject.png'></span>
                        <span>自动分录</span>
                        <badge :text="autoSubjectCount" v-if="autoSubjectCount"></badge>
                    </div>
                    <!-- <div class="box"><span><img src='../../assets/mubiao.png'></span><span>执行力分析</span></div> -->
                    <template v-for="(item,index) in appExample">
                        <div class="box" :key="index" @click="goAppExample(item)">
                            <span><img :src=item.icon></span>
                            <span>{{item.listName}}</span>
                            <badge :text=item.itemCount v-if="item.itemCount"></badge>
                        </div>
                    </template>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import Vue from 'vue'
import { Badge } from 'vux'
import { getAppExampleDetails,getAutoSubjectCount } from "service/detailService";
let  component = {
    props: {
        showSlide: {
            type: Boolean,
            default: false,
        },
        appExample: {
            type: Array,
            default() {
                return []
            }
        },
        autoSubjectCount: {
            type: Number,
            default: 0,
        },
    },
    components: {
      Badge,  
    },
    data(){
        return {
            transCode:'',
            listId:'',
            show: false,
            showAppExampleForm: false,
        }

    },
    watch: {
        showSlide: {
            handler (val) {
                this.show = val;
            }
        }
    },
    methods: {
        //切换到详情页
        goDetail() {
            this.$emit('swiperleft');
            this.$emit('goTab',{'name':'comm'});
        },
        //切换到自动分录
        autoSubject() {
            this.$emit('swiperleft');
            this.$emit('goTab',{'name':'subject'});
        },
        //切换到相关实例
        goAppExample(item) {
            if(!item.itemCount) {
                this.$emit('swiperleft');
                return
            }
            this.$emit('swiperleft');
            this.$emit('goTab',{'name':'example','data':item});
        },
        //获取自动分录count
        getAutoSubjectCount() {
            let data = {
                trans_code: this.transCode,
            };
            return getAutoSubjectCount(data).then(data => {
                this.autoSubjectCount = data.data.count;
            });    
        },
        //获取相关实例count
        getAppExampleDetails() {
            let data = {
                transCode : this.transCode,
                listId : this.listId

            };
            return getAppExampleDetails(data).then(data => {
                this.appExample = data.relevantItems;
            });  
        },
    },
    created () {
        this.transCode = this.$route.query.transCode;
    }
}
export default Vue.component('SlideBar',component);
</script>
<style lang="scss">
.side-content{
    // z-index: 11;
    position:fixed;width: 50%;
    height: 100%;
    background: #e5e5e5;
    top: 0;
    left: 0;
    bottom: 0;
    -webkit-overflow-scrolling:touch;
    background: url('../../assets/slideBar.png');
    background-position: center center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: cover;
    opacity:0.98;
    .side-content-wrap {
        padding: 5%;
        .box {
            font-size: .16rem;
            color: gray;
            span {
                margin-right: .1rem;
            }
            span img {
                width: .16rem;
                height: .16rem;
                vertical-align: middle;     
            }           
        }
    }
}
.slide-fade-enter-to, .slide-fade-leave-to{
    // transition: transform 0.3s;
    // transform:translate(0px,0px);
    transition: opacity .5s;
}
.slide-fade-enter, .slide-fade-leave-to{
    // opacity: 0;
    // -webkit-transform:translate(-200px,0px);
    // transform:translate(-200px,0px);
    // -webkit-transition:opacity 0.3s ease-in-out 0.3s,-webkit-transform 0.3s ease-in-out;
    // transition: opacity 0.3s ease-in-out 0.3s,transform 0.3s ease-in-out;
    opacity: 0;
}
</style>