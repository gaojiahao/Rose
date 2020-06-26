<template>
  <div v-transfer-dom>
    <popup class="pop_wrapper" v-model="showPop" height="100%" width="100%" position="right">
        <div class="pop-header">
          <div class="header-container">
            <i class="icon icon-return" @click="goBack"></i>
          </div>
        </div>
        <div class="date-range">
          <span>{{childrenData.treecolumn}}</span>
          <span :style="{marginLeft:'.1rem'}">
            {{`${dateList.startDate} ~ ${dateList.endDate}`}}
          </span>
        </div>
        <div class="header">
          <div class="title-form">科目</div>
          <div class="swiper-container swiper-container-header">
            <div class="swiper-wrapper">
              <div class="swiper-slide">
                <p class="parent-title">{{headInfo.firstPeriod}}</p>
                <p class="children-title">
                  <span class="debit">借方</span>
                  <span class="credit">贷方</span>
                </p>
              </div>
              <div class="swiper-slide">
                <p class="parent-title">{{headInfo.currentPeriod}}</p>
                <p class="children-title">
                  <span class="debit">借方</span>
                  <span class="credit">贷方</span>
                </p>
              </div>
              <div class="swiper-slide">
                <p class="parent-title">{{headInfo.currentYear}}</p>
                <p class="children-title">
                  <span class="debit">借方</span>
                  <span class="credit">贷方</span>
                </p>
              </div>
              <div class="swiper-slide">
                <p class="parent-title">{{headInfo.lastPeriod}}</p>
                <p class="children-title">
                  <span class="debit">借方</span>
                  <span class="credit">贷方</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <r-scroll :options="scrollOptions" ref="bScroll">
          <div class="part-left">
            <div v-for="(item, index) in childrenData.children" :key="index">
              <div class="content-item" ref="partLeft" @click.stop="onItemClick(item)">
                  {{item.treecolumn}}
              </div>
            </div>
          </div>
          <div class="swiper-container part-right">
            <div class="swiper-wrapper box">
              <div class="swiper-slide">
                <div v-for="(item, index) in childrenData.children" :key="index">
                  <div class="content-item" ref="partRightInit">
                      <span>{{item.initDr | formatNum}}</span>
                      <span>{{item.initCr | formatNum}}</span>
                  </div>
                </div>
              </div>
              <div class="swiper-slide">
                <div v-for="(item, index) in childrenData.children" :key="index">
                  <div class="content-item" ref="partRightFinal">
                      <span>{{item.dr | formatNum}}</span>
                      <span>{{item.cr | formatNum}}</span>
                  </div>
                </div>
              </div>
              <div class="swiper-slide">
                <div v-for="(item, index) in childrenData.children" :key="index">
                  <div class="content-item" ref="partRightYear">
                      <span>{{item.thisYearDr | formatNum}}</span>
                      <span>{{item.thisYearCr | formatNum}}</span>
                  </div>
                </div>
              </div>
              <div class="swiper-slide">
                <div v-for="(item, index) in childrenData.children" :key="index">
                  <div class="content-item" ref="partRightYear2">
                      <span>{{item.finalDr | formatNum}}</span>
                      <span>{{item.finalCr | formatNum}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </r-scroll>
    </popup>
    <KMYEWater
      ref="KMYEWater" 
      :waterData="waterData" 
      :dateList="dateList"
      :transcode="transcode" 
      :folder="folder" 
      :name="name">
    </KMYEWater>
  </div>
</template>

<script>
  import RScroll from 'plugins/scroll/RScroll'
  import {toFixed} from '@/plugins/calc'
  import {numberComma,Datetime,dateFormat,Popup} from 'vux'
  import KMYEWater from './KMYEWater'

  export default {
    name: "LRForm",
    data() {
      return {
        showPop: false,
        childrenData: this.listData,
        waterData: {},
        beforeHistory: {},
        headInfo: {
          firstPeriod: '期初金额',
          currentPeriod: '本期发生额',
          currentYear: '本年累计',
          lastPeriod: '期末余额'
        },
        scrollOptions: {
          click: true,
          bounce: {
            top: false
          }
        }
      }
    },
    components: {
      RScroll,
      Datetime,
      Popup,
      KMYEWater
    },
    props: {
      transcode: {
        type: String,
        default: ''
      },
      folder: {
        type: String,
        default: ''
      },
      name: {
        type: String,
        default: ''
      },
      listData: {
        type: Object,
        default: {}
      },
      dateList: {
        type: Object,
        default: {}
      }
    },
    watch: {
      showPop: function(val){
        if(val) {
          this.childrenData = this.listData;
          // 设置金额行高度，判断高度是否与title相同，不相同则设置为title的高度
          this.$nextTick(() => {
            // 初始化数据
            this.initSwiper();
            this.setHeight(
              this.$refs.partLeft, 
              this.$refs.partRightInit, 
              this.$refs.partRightFinal
            );
          })
        }
      }
    },
    methods: {
      onItemClick(item){
        if(item.leaf){
          //跳到科目余额流水
          this.waterData = item;
          this.$refs["KMYEWater"].showWater = true;
          return;
        }
        this.childrenData = item;
      },
      goBack() {
        this.showPop = false;
      },
      // 设置高度
      setHeight(left,rightInit,rightFinal) {
        let right = [rightInit,rightFinal];
        let right2 = [rightInit,rightFinal];
        if(this.$refs.partRightYear){
          right.push(this.$refs.partRightYear);
        }
        if(this.$refs.partRightYear2){
          right2.push(this.$refs.partRightYear2);
        }
        left.forEach((item,index) => {
          right.forEach(rRight => {
            if(item.clientHeight !== rRight[index].clientHeight){
              rRight[index].style.height = `${item.clientHeight}px`;
            }
          })
          right2.forEach(rRight => {
            if(item.clientHeight !== rRight[index].clientHeight){
              rRight[index].style.height = `${item.clientHeight}px`;
            }
          })
        })
      },
      // 初始化swiper
      initSwiper() {
        this.$nextTick(() => {
          this.partRightSwiper = new this.Swiper('.part-right',{
            slidesPerView : 'auto',
            longSwipersRadio: 0.9,
            freeMode: true,
          });
          this.headerSwiper = new this.Swiper('.swiper-container-header',{
            slidesPerView : 'auto',
            longSwipersRadio: 0.9,
            freeMode: true,
            observer: true,//修改swiper自己或子元素时，自动初始化swiper
            observeParents: true,
          });
          this.partRightSwiper.controller && (this.partRightSwiper.controller.control = this.headerSwiper);
          this.headerSwiper.controller && (this.headerSwiper.controller.control = this.partRightSwiper);
        })
      }
    },
    filters: {
      // 格式化数字
      formatNum(num) {
        if (!num) return '-';
        return `${numberComma(num.toFixed(2))}`;
      }
    }
  }
</script>

<style scoped lang="scss">
  %border-1px {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    width: 200%;
    border-top: 1px solid #C7C7C7;
    color: #C7C7C7;
    transform-origin: 0 0;
    transform: scaleY(0.5);
    box-sizing: border-box;
  }

  .pop_wrapper {
    height: 100%;
    overflow: hidden;
    background-color: #fff;
    .date-range{
      padding: .1rem;
      border-bottom: 1px solid #eee;
    }

    .pop-header{
      width: 100%;
      height: .40rem;
      background-color: rgb(50, 150, 250);
      color: #FFF;
      .header-container{
        position: relative;
        .icon {
          top: .1rem;
          z-index: 1;
          left: .10rem;
          width: .14rem;
          height: .2rem;
          position: absolute;
        }
      }
    }

    /* 头部 */
    .header {
      display: flex;
      justify-content: space-between;
      width: 100%;
      line-height: .25rem;
      box-sizing: border-box;
      .title-form{
        font-size: .14rem;
        width: 50%;
        background-color: #eee;
        text-align: center;
        line-height: .5rem;
        border-right: 1px solid #fff;
      }
    }
    /* 顶部期初、期末 */
    .swiper-container-header {
      margin: 0;
      width: 50%;
      height: 100%;
      text-align: right;
      font-size: .14rem;
    }

    .scroll-container {
      height: calc(100% - .85rem);
      font-size: 0;
    }
    /deep/ .scroll-wrapper {
      display: flex;
    }
    .part-left, .part-right {
      width: 50%;
      font-size: .14rem;

      .content-item {
        position: relative;
        padding: .05rem .15rem;
        width: 100%;
        line-height: .25rem;
        box-sizing: border-box;
        /* 标题 */
        .title {
          padding: .05rem .15rem;
          min-height: .4rem;
          line-height: .3rem;
          font-size: .16rem;
          font-weight: bold;
          box-sizing: border-box;
        }
      }
    }
    .part-left {
      .bg-color{
        background-color: #eee;
      }
      .title {
        position: relative;
      }
      .content-item {
        &.is-first {
          &:before {
            @extend %border-1px;
            top: 0;
          }
          &:after {
            @extend %border-1px;
            bottom: 0;
          }
        }
      }
    }
    .swiper-container {
      margin: 0 auto;
      position: relative;
      overflow: hidden;
      list-style: none;
      padding: 0;
      z-index: 1;
      .swiper-wrapper {
        .swiper-slide {
          width: 100%;
          .parent-title{
            text-align: center;
            background-color: #eee;
          }
          .children-title{
              display: flex;
              justify-content: space-between;
              span{
                text-align: center;
                width: 50%;
                display: inline-block;
              }
              .debit{
                background-color:#cadbec;
                color: #4b76a0;
              }
              .credit{
                background-color: #f0e4ce;
                color: #c15524;
              }
          }
        }
      }
    }
    .part-right {
      text-align: right;
      .bg-color{
        background-color: #eee;
      }
      .content-item {
        padding-left: 0;
        display: flex;
        justify-content: space-between;
        span{
          text-align: right;
          width: 50%;
          display: inline-block;
        }
      }
    }
    /* 1px边框 */
    .border-1px-t {
      &:before {
        @extend %border-1px;
        top: 0;
      }
    }
    .border-1px-b {
      &:after {
        @extend %border-1px;
        bottom: 0;
      }
    }
  }
</style>
