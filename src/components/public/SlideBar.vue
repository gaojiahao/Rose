<template>
    <transition name="slide-fade">
        <div class="side-content" v-show="isRellyShow && transCode">
            <div class="side-content-wrap">
                <div class="box"><span><img src='../../assets/slideBar-home.png'></span><span>基本信息</span></div>
                <div class="box" ><span><img src='../../assets/slideBar-history.png'></span><span>变更历史</span></div>
                <div class="box" @click="autoSubject"><span><img src='../../assets/view-subject.png'></span><span>自动分录</span></div>
                <div class="box"><span><img src='../../assets/mubiao.png'></span><span>执行力分析</span></div>
                <template v-for="(item,index) in appExample">
                    <div class="box" :key="index"><span><img :src=item.icon></span><span>{{item.listName}}</span></div>
                </template>
            </div>     
        </div>    
    </transition>
</template>

<script>
import Vue from 'vue'
import { getAppExampleDetails } from "service/detailService";
let  component = {
    props: {
        isRellyShow: {
            type: Boolean,
            default: false,
        },
    },
    data(){
        return {
            appExample:{},
            transCode:'',
            listId:'',
        }

    },
    methods: {
        getAppExampleDetails() {
            let data = {
                transCode : this.transCode,
                listId : this.listId

            };
            return getAppExampleDetails(data).then(data => {
                this.appExample = data.relevantItems;
            });  
        },
        autoSubject() {
            //let {transCode = ''} = this.workFlowInfo;
            this.$router.push({
                path: '/autoSubject',
                query: {
                    listId,
                    transCode,
                }
            })
        }
    },
    created () {
        this.transCode = this.$route.query.transCode;
        this.listId = this.$route.query.listId;
        if(this.transCode && this.listId) {
            this.getAppExampleDetails();
        }
    }
}
export default Vue.component('SlideBar',component);
</script>
<style lang="scss">
    .side-content{
        // z-index: 11;
        position:fixed;width: 200px;
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
        transition: transform 0.3s;
        transform:translate(0px,0px);
    }
    .slide-fade-enter, .slide-fade-leave-to{
        opacity: 0;
        -webkit-transform:translate(-200px,0px);
        transform:translate(-200px,0px);
        -webkit-transition:opacity 0.3s ease-in-out 0.3s,-webkit-transform 0.3s ease-in-out;
        transition: opacity 0.3s ease-in-out 0.3s,transform 0.3s ease-in-out;
    }

</style>