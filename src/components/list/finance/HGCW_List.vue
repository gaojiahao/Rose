<template>
  <!-- 合规财务报表 -->
  <div class="pages">
    <div class='content'>
      <slot name="nav"></slot>
      <div class="list_top">
        <div class="tab-container" ref="tabContainer">
          <div class="tab-item" :class="{active: index === activeIndex}" v-for="(item, index) in listData"
               @click="tabClick(item, index)" ref="tabs" :key="index">
            <div class="tab-item-title">{{item.title}}</div>
          </div>
        </div>
      </div>
      <div style="height:.1rem;width:100%;background-color:#eee"></div>
      <!-- tab -->
      <div class="swiper-container list-container" :class="{'list-container2':hasNav}">
        <!-- 利润表 -->
        <template v-if="activeIndex==0">
          <LRForm :transcode="listMap[activeIndex].transcode" :folder="listMap[activeIndex].folder" :name="listMap[activeIndex].name"></LRForm>
        </template>
        <!-- 资产负债表 -->
        <template v-else-if="activeIndex==1">
          <ZCFZForm :transcode="listMap[activeIndex].transcode" :folder="listMap[activeIndex].folder" :name="listMap[activeIndex].name"></ZCFZForm>
        </template>
        <!-- 现金流量表 -->
        <template v-else-if="activeIndex==2">
          <XJLLForm :transcode="listMap[activeIndex].transcode" :folder="listMap[activeIndex].folder" :name="listMap[activeIndex].name"></XJLLForm>
        </template>
        <!-- 科目余额表 -->
        <template v-else-if="activeIndex==3">
          <KMYEForm :transcode="listMap[activeIndex].transcode" :folder="listMap[activeIndex].folder" :name="listMap[activeIndex].name"></KMYEForm>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {Group, Cell} from 'vux'
import RScroll from 'plugins/scroll/RScroll'
import platform from 'plugins/platform/index'
// 插件 引入
import LRForm from 'components/list/finance/CWKJ/LRForm'
import ZCFZForm from 'components/list/finance/CWKJ/ZCFZForm'
import XJLLForm from 'components/list/finance/CWKJ/XJLLForm'
import KMYEForm from 'components/list/finance/CWKJ/KMYEForm/KMYEForm'
export default {
  name: "HGCW_List",
  data() {
    return {
      listData: [
        {
          title: '利润表',
          code: 'LR',
        }, {
          title: '资产负债表',
          code: 'ZCFZ',
        },
        {
          title: '现金流量表',
          code: 'XJLL',
        },
        {
          title: '科目余额表',
          code: 'KMYE'
        }
      ],
      listMap:{
        '0':{ transcode:'LR', folder:'finance', name:'利润表' },
        '1':{ transcode:'ZCFZ', folder:'finance', name:'资产负债表' },
        '2':{ transcode:'XJLL', folder:'finance', name:'现金流量表' },
        '3':{ transcode:'KMYE', folder:'finance', name:'科目余额表' }
      },
      activeIndex: 0,
      scrollOptions: {
        click: true,
      },
      hasNav:false,
    }
  },
  components: {
    Cell, Group , LRForm , ZCFZForm , XJLLForm ,KMYEForm,RScroll
  },
  methods: {
    goBack(){
      window.history.go(-1);
    },
    initSwiper() {
      this.$nextTick(() => {
        this.listSwiper = new this.Swiper('.list-container', {
          touchAngle: 30,
          noSwiping : true,
          on: {
            slideChangeTransitionStart: () => {
              let index = this.listSwiper.activeIndex;
              this.activeIndex = index;
            },
          },
        });
      })
    },
    // tab切换
    tabClick(val, index) {
      this.activeIndex = index;
      //this.listSwiper.slideTo(index);
    },
    onPullingUp(){

    },
    onPullingDown(){

    },
  },
  created() {
    this.$loading.hide();
    this.hasNav = platform.isQYWX || platform.isDD
    //this.initSwiper();
    // this.$nextTick(() => {
    //   this.listSwiper.update();
    // })
  }
}
</script>

<style scoped lang="scss">
.content {
  width: 100%;
  height: 100%;
  overflow: auto;
}
  .list-container {
    height: calc(100% - .86rem);
    .list_wrapper {
      height: 100%;
      background-color: #fff;
    }
  }
  .list-container2 {
    height: calc(100% - .46rem);
    .list_wrapper {
      height: 100%;
      background-color: #fff;
    }
  }
  .header{
    width: 100%;
    height: .40rem;
    background-color: rgb(50, 150, 250);
    color: #FFF;
    .header-container{
      width: 100%;
      display: flex;
      height: .40rem;
      position: relative;
      line-height: .40rem;
      box-sizing: border-box;
      .icon {
        top: .1rem;
        z-index: 1;
        left: .10rem;
        width: .14rem;
        height: .2rem;
        position: absolute;
      }
      .center{
        text-align: center;
        width: 33.33%;
        margin-left: 33.33%;
      }
    }
  }
  .tab-container {
    display: flex;
    align-items: center;
    width: 100%;
    height: .36rem;
    color: #333;
    white-space: nowrap;
    overflow: auto;
    box-sizing: border-box;
    .tab-item {
      line-height: .34rem;
      font-size: .14rem;
      line-height: .34rem;
      width: 33.333333333333333%;
      text-align: center;
      & + .tab-item {
        //margin-left: .2rem;
      }
      .tab-item-title{
        padding: 0 .15rem;
      }
      &:last-child {
      }
      // padding-right: .15rem;
      &.active {
        color: rgb(50, 150, 250);
        // font-size: .18rem;
        font-weight: 600;
        border-bottom: 2px solid rgb(50, 150, 250);
      }
    }
  }
</style>
