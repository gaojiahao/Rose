<template>
  <div class="detail_wrapper">
    <div class="end-date">
      <group>
        <datetime
          v-model="endDate"
          :format="headInfo['currentYearName']?'YYYY-MM':'YYYY-MM-DD'"
          @on-change="endDateChange">
          <h5 slot="title" :style="{fontSize:'.15rem'}">{{headInfo['currentYearName']?'会计期间':'截至日期'}}</h5>
        </datetime>
      </group>
    </div>
    <div class="header">
      <div class="title-form">{{`单位：${localCurrency}`}}</div>
      <div class="swiper-container swiper-container-header">
        <div class="swiper-wrapper">
          <div class="swiper-slide">{{headInfo.firstName}}</div>
          <div class="swiper-slide">{{headInfo.LastName}}</div>
          <div v-if="headInfo.currentYearName" class="swiper-slide">{{headInfo.currentYearName}}</div>
          <div v-if="headInfo.lastYearAmount" class="swiper-slide">{{headInfo.lastYearAmount}}</div>
        </div>
      </div>
    </div>
    <load-more :tip="'加载中'" v-if="noData"></load-more>
    <r-scroll :options="scrollOptions" ref="bScroll">
      <div class="part-left">
        <div v-for="(item, index) in listData" :key="index" :class="{'bg-color':item.total}">
          <div class="content-item"
              :class="{'final-total': item.total,
              'title': item.total}" 
              :style="{paddingLeft:`${item.indent*.65}em`}"
              ref="partLeft">
              {{item.financeName}}
          </div>
        </div>
      </div>
      <div class="swiper-container part-right">
        <div class="swiper-wrapper box">
          <div class="swiper-slide div" style="width:33.33333%">
            <div v-for="(item, index) in listData" :key="index" :class="{'bg-color':item.total}">
              <div class="content-item"
                  :class="{'final-total': item.total || item.bigSubject}"
                  ref="partRightInit">
                  {{headInfo['currentYearName']?item.finalAmount:item.initAmount | formatNum}}
              </div>
            </div>
          </div>
          <div class="swiper-slide div" style="width:33.33333%">
            <div v-for="(item, index) in listData" :key="index" :class="{'bg-color':item.total}">
              <div class="content-item"
                  :class="{'final-total': item.total || item.bigSubject}"
                  ref="partRightFinal">
                  {{headInfo['currentYearName']?item.initAmount:item.finalAmount | formatNum}}
              </div>
            </div>
          </div>
          <div v-if="headInfo.currentYearName" class="swiper-slide div" style="width:33.33333%">
            <div v-for="(item, index) in listData" :key="index" :class="{'bg-color':item.total}">
              <div class="content-item"
                  :class="{'final-total': item.total || item.bigSubject}"
                  ref="partRightYear">
                  {{item.thisYearAmount | formatNum}}
              </div>
            </div>
          </div>
          <div v-if="headInfo.lastYearAmount" class="swiper-slide" style="width:100%">
            <div v-for="(item, index) in listData" :key="index" :class="{'bg-color':item.total}">
              <div class="content-item"
                  :class="{'final-total': item.total || item.bigSubject}"
                  ref="partRightYear2">
                  {{item.lastYearAmount | formatNum}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </r-scroll>
  </div>
</template>

<script>
  import {getOffBalance, getProfit, getLocalCurrency} from 'service/kmService'
  import RScroll from 'plugins/scroll/RScroll'
  import {toFixed} from '@/plugins/calc'
  import {accAdd} from "plugins/calc/decimalsAdd";
  import {numberComma,Datetime,Group,dateFormat,LoadMore} from 'vux'

  export default {
    name: "LRForm",
    data() {
      return {
        endDate: '',
        headerSwiper: null,         // 顶部swiper
        partRightSwiper: null,      // 右侧金额swiper
        code: '',  
        localCurrency: "",                 // 路由参数
        headInfo:{},                // 表头信息
        listData: {},
        listMap: {
          ZCFZ: {
            title: '资产负债表',
            firstName: '期初',
            LastName: '期末',
            request: getOffBalance
          },
          LR: {
            title: '利润表',
            firstName: '本期',
            LastName: '上期',
            currentYearName: '本年累计',
            lastYearAmount: '上年同期累计',
            request: getProfit
          },
        },
        scrollOptions: {
          click: true,
          bounce: {
            top: false
          }
        },
        noData:true,
      }
    },
    components: {
      RScroll,
      Datetime,
      Group,
      LoadMore,
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
      }
    },
    watch:{
      transcode:{
        handler(val){
          console.log(val)
        }
      }
    },
    methods: {
      endDateChange(){
        this.getData();
      },
      // 获取资产负债表数据
      getData() {
        return this.listMap[this.code].request(this.endDate).then(res => {
          let {data = []} = res;

          this.listData = data;
          this.noData = false;
          this.$nextTick(() => {
            // 设置金额行高度，判断高度是否与title相同，不相同则设置为title的高度
            this.setHeight(
              this.$refs.partLeft, 
              this.$refs.partRightInit, 
              this.$refs.partRightFinal);
          })
        })
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
          this.partRightSwiper = new this.Swiper('.part-right',{slidesPerView : 'auto',
          longSwipersRadio: 0.9,
          freeMode: true,
          });
          this.headerSwiper = new this.Swiper('.swiper-container-header',{slidesPerView : 'auto',
          longSwipersRadio: 0.9,
          freeMode: true,
          });
          this.partRightSwiper.controller && (this.partRightSwiper.controller.control = this.headerSwiper);
          this.headerSwiper.controller && (this.headerSwiper.controller.control = this.partRightSwiper);
          
        })
      },
      //获取企业货币
      getLocalCurrencyData() {
        getLocalCurrency().then(({list = []}) => {
          list.forEach(item => {
            if(item.localCurrency){
              this.localCurrency = item.currencyValue === 'CNY' ? '万' : item.currency;
            }
          })
        })
      }
    },
    filters: {
      // 格式化数字
      formatNum(num) {
        if (!num) return '-';
        return `${numberComma((num/10000).toFixed(2))}`;
      }
    },
    created() {
      let {trancode = ''} = this.$route.query;
      this.code = this.transcode;
      //获取表格的表头信息
      this.headInfo = { ...this.listMap[this.transcode] };
      if(this.headInfo['currentYearName']){
        this.endDate = dateFormat(new Date(), 'YYYY-MM');
      }else{
        this.endDate = dateFormat(new Date(), 'YYYY-MM-DD');
      }
      // 初始化数据
      this.initSwiper();
      this.getData();
      this.getLocalCurrencyData();
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

  .detail_wrapper {
    height: 100%;
    overflow: hidden;
    background-color: #fff;

    .end-date /deep/ .vux-no-group-title{
      margin-top: 0;
    }
    .end-date /deep/ .weui-cells{
      margin-top: 0;
      line-height: 1.2;
    }

    /* 头部 */
    .header {
      display: flex;
      justify-content: space-between;
      padding: .05rem .15rem;
      width: 100%;
      height: .35rem;
      line-height: .25rem;
      box-sizing: border-box;
      .title-form{
        font-size: .14rem;
        width: 50%;
        // text-decoration:underline
        // font-weight: bold;
      }
    }
    .weui-loadmore {
      width: 65%;
      margin: 1.5em auto;
      line-height: 1.6em;
      font-size: 14px;
      text-align: center;
      z-index: 999;
      height: calc(100% - .76rem);
    }
    /* 顶部期初、期末 */
    .swiper-container-header {
      margin: 0;
      width: 50%;
      height: 100%;
      text-align: right;
      font-size: .14rem;
    }

    .scroll-wrapper {
      height: calc(100% - .76rem);
      font-size: 0;
    }
    /deep/ .scroll-content {
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

        /* 资产合计 */
        &.final-total {
          line-height: .3rem;
          font-size: .14rem;
          font-weight: bold;
        }

        /* 利润表首行 */
        &.is-first {
          line-height: .3rem;
          font-size: .2rem;
          font-weight: bold;
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
        &.indent {
          padding-left: 3em;
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
        .swiper-slide:nth-child(1) {
          width: 33.33333%;
        }
        .swiper-slide:nth-child(2) {
          width: 33.33333%;
        }
        .swiper-slide:nth-child(3) {
          width: 33.33333%;
        }
        .swiper-slide:nth-child(4) {
          width: 100%;
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
