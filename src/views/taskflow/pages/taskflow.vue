<template>
    <div class="task-container page-hasTab" >
        <slot name="nav" ></slot>
        <div class="header">
            <div class="swiper-tab">
                <div class="tab-item" 
                    :class="{active: $route.name === item.key}" 
                    v-for="(item, index) in tabItem"
                     ref="tabs" :key="index">
                    <!-- {{item.name}} -->
                    <router-link :to="{name: item.key}"> {{item.name}}</router-link>
                </div>
            </div>
        </div>

         <router-view></router-view>
        
        <!-- <div class="swiper-container list-container">
            <div class="swiper-wrapper">
                <div class="swiper-slide" v-for="(slide, key) in listMap" :key="key">
                        <template v-if="slide.name=='myToDoTask'">
                            <myToDoTask></myToDoTask>
                        </template>
                        <template v-else-if="slide.name=='myCompleted'">
                            <myCompleted></myCompleted>
                        </template>
                </div>
            </div>
        </div> -->
    </div>
</template>

<script>
import { Tab, TabItem } from 'vux'
import RScroll from "plugins/scroll/RScroll";
import taskCommon from 'mixins/taskCommon';
import myToDoTask from '@/views/taskflow/pages/myToDoTask'
import myCompleted from '@/views/taskflow/pages/myCompleted'
export default {
    components: {
    Tab,
    TabItem,
    RScroll,
    myToDoTask,
    myCompleted
    },
    mixins: [taskCommon],
    data(){
        return {
            tabItem:[
                // {name:'工作流任务',key:'flowTask'},
                // {name:'项目任务',key:'projectTask'},
                // {name:'日志任务',key:'dailyTask'}
                {name:'我的待办',key:'myToDoTask'},
                {name:'我的已办',key:'myCompleted'},
            ],
            listMap:{
                '0':{ name:'myToDoTask', folder:'finance' },
                '1':{ name:'myCompleted', folder:'finance' },
            },
        }
    },
    methods:{
        tabClick(val, index) {
            this.activeIndex = index;
            this.activeTab = val.name;
            this.listSwiper.slideTo(index);
        },
        // 初始化swiper
        initSwiper() {
            this.$nextTick(() => {
            this.listSwiper = new this.Swiper('.list-container', {
                touchAngle: 30,
                noSwiping : true,
                on: {
                slideChangeTransitionStart: () => {
                    let index = this.listSwiper.activeIndex;
                    let tab = this.listMap[index];
                    this.activeIndex = index;
                    this.activeTab = tab.name;
                    //this.scrollToShow(index);
                },
                },
            });
            })
        },
    },
    created(){
        // this.initSwiper();
    },
    activated(){
    },
    mounted(){
    }
}

</script>
<style lang="scss" scoped>
input::-webkit-input-placeholder {
    color: #fff;
}
input::-moz-input-placeholder {
    color: #fff;
}
input::-ms-input-placeholder {
    color: #fff;
}
.task-container{
    background:#f7f7f7;
    .wrapper {
        height: 100%;
        // height: 7.2rem;
    }
    .header {
        background: white;
        height: .4rem;
        .search {
            width: 100%;
            padding: .08rem 0;
            .search_part {
                width: 100%;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                height: .34rem;
                position: relative;
                line-height: .34rem;
                -webkit-box-sizing: border-box;
                box-sizing: border-box;
                .icon {
                    top: 50%;
                    z-index: 1;
                    left: .15rem;
                    width: .14rem;
                    height: .20rem;
                    fill: #2d2d2d;
                    position: absolute;
                    -webkit-transform: translate(0, -50%);
                    -ms-transform: translate(0, -50%);
                    transform: translate(0, -50%);
                }
                .srh_inp {
                    -webkit-box-flex: 1;
                    -ms-flex: 1;
                    flex: 1;
                    border: none;
                    outline: none;
                    color: #fff;
                    -moz-appearance: none;
                    appearance: none;
                    font-size: .14rem;
                    margin-left: .39rem;
                    border-radius: .2rem;
                    background: none;
                    -webkit-appearance: none;
                    text-align:center;
                    margin-right: .37rem;
                }
                .clear_icon {
                    top: 50%;
                    right: .15rem;
                    width: .18rem;
                    height: .18rem;
                    display: block;
                    font-size: .12rem;
                    line-height: .3rem;
                    text-align: center;
                    position: absolute;
                    -webkit-transform: translate(0, -50%);
                    -ms-transform: translate(0, -50%);
                    transform: translate(0, -50%);
                }
            }
        }
        .swiper-tab {
            width: 100%;
            height: .40rem;
            overflow: hidden;
            .tab-item{
                width: 50%;
                line-height: .36rem;
                font-size: .14rem;
                text-align: center;
                float: left;
                a{
                    color:#9E9E9E;
                }
            }
            .active {
                
                border-bottom: 3px solid #3296fa;
                a{
                    color: #3296fa;
                }
            }
        }
    }
    .list-container {
        height: calc(100% - 18rem);
        .list_wrapper {
        height: 100%;
        background-color: #fff;
        }
    }
}
</style>