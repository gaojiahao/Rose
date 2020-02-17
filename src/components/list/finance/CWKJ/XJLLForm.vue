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
      <div class="swiper-container swiper-container-header2">
        <div class="swiper-wrapper">
          <div class="swiper-slide">{{headInfo.firstName}}</div>
          <div class="swiper-slide">{{headInfo.LastName}}</div>
          <!-- <div v-if="headInfo.currentYearName" class="swiper-slide">{{headInfo.currentYearName}}</div> -->
        </div>
      </div>
    </div>
    <r-scroll :options="scrollOptions" ref="bScroll">
      <div class="part-left">
        <div v-for="(item, index) in listData" :key="index">
          <div class="content-item"
               :class="{'final-total': item.total,
               'title': item.total,
               'bg-color': item.indent==0,
               'pleft': item.indent==3,
               'pleft2': item.indent==4.5}" 
               ref="partLeft">
               {{item.cashFlow}}
          </div>
        </div>
      </div>
      <div class="swiper-container part-right2">
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div v-for="(item, index) in listData" :key="index">
              <div class="content-item"
                   :class="{'final-total': item.indent == 4.5,
                   'bg-color': item.indent==0}"
                   ref="partRightInit">
                   {{headInfo['currentYearName']?item.finalAmount:item.initAmount | formatNum}}
              </div>
            </div>
          </div>
          <div class="swiper-slide">
            <div v-for="(item, index) in listData" :key="index">
              <div class="content-item"
                   :class="{'final-total': item.indent == 4.5,
                   'bg-color': item.indent==0}"
                   ref="partRightFinal">
                   {{headInfo['currentYearName']?item.initAmount:item.finalAmount | formatNum}}
              </div>
            </div>
          </div>
          <!-- <div v-if="headInfo.currentYearName" class="swiper-slide">
            <div v-for="(item, index) in listData" :key="index">
              <div class="content-item"
                   :class="{'final-total': item.total || item.bigSubject,
                   'bg-color': item.indent==0}"
                   ref="partRightYear" v-if="headInfo['currentYearName']!='本年'">
                   {{item.thisYearAmount | formatNum}}
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </r-scroll>
  </div>
</template>

<script>
  import {getOffBalance, getProfit, getLocalCurrency,getCashFlowSheet} from 'service/kmService'
  import RScroll from 'plugins/scroll/RScroll'
  import {toFixed} from '@/plugins/calc'
  import {accAdd} from "plugins/calc/decimalsAdd";
  import {numberComma,Datetime,Group,dateFormat} from 'vux'

  export default {
    name: "XJLLForm",
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
          XJLL: {
            title: '现金流量表',
            firstName: '本期金额',
            LastName: '上期金额',
            currentYearName: '本年',
            request: getCashFlowSheet
          },
        },
        scrollOptions: {
          bounce: {
            top: false
          }
        }
      }
    },
    components: {
      RScroll,
      Datetime,
      Group
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
          this.$nextTick(() => {
            // 设置金额行高度，判断高度是否与title相同，不相同则设置为title的高度
            this.setHeight(
              this.$refs.partLeft, 
              this.$refs.partRightInit, 
              this.$refs.partRightFinal);
            this.$loading.hide();
          })
        })
      },
      // 设置高度
      setHeight(left,rightInit,rightFinal) {
        let right = [rightInit,rightFinal];
        if(this.$refs.partRightYear){
          right.push(this.$refs.partRightYear);
        }
        left.forEach((item,index) => {
          right.forEach(rRight => {
            if(item.clientHeight !== rRight[index].clientHeight){
              rRight[index].style.height = `${item.clientHeight}px`;
            }
          })
        })
      },
      // 初始化swiper
      initSwiper() {
        this.$nextTick(() => {
          this.partRightSwiper = new this.Swiper('.part-right2');
          this.headerSwiper = new this.Swiper('.swiper-container-header2');
          this.partRightSwiper.controller.control = this.headerSwiper;
          this.headerSwiper.controller.control = this.partRightSwiper;
        })
      },
      //获取企业货币
      getLocalCurrencyData() {
        getLocalCurrency().then(({list = []}) => {
          list.forEach(item => {
            if(item.localCurrency){
              this.localCurrency = item.currencyValue === 'CNY' ? '元' : item.currency;
            }
          })
        })
      }
    },
    filters: {
      // 格式化数字
      formatNum(num) {
        if (!num) return '-';
        return `${numberComma(num.toFixed(2))}`;
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
        font-size: .15rem;
        // text-decoration:underline
        // font-weight: bold;
      }
    }
    /* 顶部期初、期末 */
    .swiper-container-header2 {
      margin: 0;
      width: 50%;
      height: 100%;
      text-align: right;
      font-size: .14rem;
    }

    .scroll-container {
      height: calc(100% - .76rem);
      font-size: 0;
    }
    /deep/ .scroll-wrapper {
      display: flex;
    }
    .part-left, .part-right2 {
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
          font-size: .14rem;
          font-weight: 600;
        }

        /* 利润表首行 */
        &.is-first {
          line-height: .3rem;
          font-size: .2rem;
          font-weight: bold;
        }
      }
      .pleft{
        padding-left: .26rem;
      }
      .pleft2{
        padding-left: .3rem;
        font-weight: 600;
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
    .part-right2 {
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
