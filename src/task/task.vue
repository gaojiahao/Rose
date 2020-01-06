<template>
    <div class="task-container" >
        <div class="header">
            <div class="search">
                <form class='search_part' action="#" method="post">
                    <i class="icon icon-more2"></i>
                    <input type="search" autocomplete="off" placeholder="任务名称" class="srh_inp">
                    <i class="icon-taskSearch clear_icon"></i>
                </form>
            </div>
            <div class="swiper-tab">
                <div class="tab-item" :class="{active: index === activeIndex}" v-for="(item, index) in tabItem"
                    @click="tabClick(item, index)" ref="tabs" :key="index">
                    {{item.name}}
                </div>
            </div>
        </div>
        <div class="swiper-container list-container">
            <div class="swiper-wrapper">
                <div class="swiper-slide" v-for="(slide, key) in listMap" :key="key">
                    <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="slide.hasNext"
                            :no-data="!slide.hasNext && !slide.listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                            ref="bScroll">
                        <template v-if="activeTab=='flowTask'">
                            <div class="verification-item-wrapper">
                                aa
                            </div>    
                        </template>
                        <template v-else-if="activeTab=='projectTask'">
                            <div class="verification-item-wrapper">
                                bb
                            </div>  
                        </template>
                        <template v-else-if="activeTab=='dailyTask'">
                            <div class="verification-item-wrapper">
                                cc
                            </div>    
                        </template>
                    </r-scroll>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Tab, TabItem } from 'vux'
import RScroll from "plugins/scroll/RScroll";
import taskCommon from 'mixins/taskCommon'
export default {
    components: {
    Tab,
    TabItem,
    RScroll
    },
    mixins: [taskCommon],
    data(){
        return {
            tabItem:[
                {name:'工作流任务',key:'flowTask'},
                {name:'项目任务',key:'projectTask'},
                {name:'日志任务',key:'dailyTask'}
            ],
            listMap:{},
        }
    },
    methods:{
        tabClick(val, index) {
            if (index === this.activeIndex) {
                this.currentScroll.scrollTo(0, 0);
                return;
            }
            this.activeIndex = index;
            this.activeTab = val.key;
            this.currentScroll.scrollTo(0, 0);
            this.resetCondition();
            this.getList();
            this.listSwiper.slideTo(index);
        },
        // 初始化swiper
        initSwiper() {
            this.$nextTick(() => {
            this.listSwiper = new this.Swiper('.list-container', {
                touchAngle: 30,
                on: {
                slideChangeTransitionStart: () => {
                    let index = this.listSwiper.activeIndex;
                    let tab = this.tabItem[index];
                    this.activeIndex = index;
                    this.activeTab = tab.key;
                    this.scrollToShow(index);
                    // 已有数据则不重新请求
                    if (this.currentItem.listData.length) {
                    return
                    }
                    this.resetCondition();
                    this.getListData();
                },
                },
            });
            })
        },
    },
    created(){
    },
    activated(){
    },
    mounted(){
    }
}

</script>
<style lang="less" scoped>
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
    overflow: hidden;
    height: 100%;
    background:#f8fcff;
    .wrapper {
        height: calc(100% - 10.99rem);
        // height: 7.2rem;
    }
    .header {
        // background:linear-gradient(to top, rgb(76,149,136), 50%, rgb(71,215,146));
        background:rgb(71,215,146);
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
            height: .30rem;
            overflow: hidden;
            padding-top: .1rem;
            color: #bfbfbf;
            background:linear-gradient(to top, rgb(76,180,136), 50%, rgb(71,215,146));
            .tab-item{
                width: 33.333%;
                line-height: .27rem;
                font-size: .14rem;
                text-align: center;
                float: left;
            }
            .active {
                color: #fff;
                border-bottom: 3px solid white; 
            }
        }
    }
    .list-container {
        height: calc(100% - .96rem);
        .list_wrapper {
        height: 100%;
        background-color: #fff;
        }
    }
}
.verification-item-wrapper {
    color: #333;
    margin: .1rem;
    position: relative;
    border-radius: 4px;
    background: #FFF;
    padding: .2rem .15rem;
    box-sizing: border-box;
    width: calc(100% - .2rem);
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
    .verification-main {
      display: flex;
      .verification_img {
        width: .5rem;
        height: .5rem;
        border-radius: .04rem;
      }
      .verification_info {
        margin-left: .12rem;
        line-height: .12rem;
        font-size: .12rem;
      }
      .app_name {
        line-height: .18rem;
        font-size: .14rem;
        font-weight: 600;
      }
      .verification_info_item {
        margin-top: .12rem;
        & + .verification_info_item {
          margin-top: .08rem;
        }
      }
      .verification_info_title {
        color: #999;
      }
    }

    .verification-split {
      position: relative;
      margin: .2rem 0 .13rem;
      height: 1px;
      border-top: 1px dashed #DEDFE6;
    }

    .verification-bottom {
      font-size: .12rem;
      text-align: center;
      position: relative;
      line-height: .12rem;
      .verification_bottom_item {
        &.days, &.amt, &.acount_day {
          position: absolute;
        }
        &.days {
          left: 0;
        }
        &.amt {
          top: -1px;
          right: 0;
          color: #FA7138;
          .verification_bottom_value {
            font-weight: bold;
            font-size: .16rem;
          }
        }
        &.acount_day {
          top: -1px;
          right: 0;
        }
      }
      .verification_bottom_value {
        font-size: .14rem;
      }
      .verification_bottom_title {
        margin-top: .08rem;
        color: #999;
      }
      .symbol {
        font-size: .12rem;
      }
      & + .verification-bottom {
        margin-top: .2rem;
      }
    }
  }
</style>