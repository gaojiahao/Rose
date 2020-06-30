<template>
  <div class="detail_wrapper">
    <div class="title">
      <flexbox>
        <flexbox-item><div class="flex-demo">周期</div></flexbox-item>
        <flexbox-item><div class="flex-demo">本月</div></flexbox-item>
        <flexbox-item><div class="flex-demo">按物料查看</div></flexbox-item>
        <flexbox-item><div class="flex-demo">按仓库查看</div></flexbox-item>
      </flexbox>
    </div>
    <div class="title2">
      <div>
        <div class="">物料编码</div>
        <div class="">物料名称</div>
      </div>
      <div class="swiper-container swiper-container-header">
        <div class="swiper-wrapper">
          <div class="swiper-slide">{{headInfo.initQty}}</div>
          <div class="swiper-slide">{{headInfo.drAmount}}</div>
          <div class="swiper-slide">{{headInfo.crAmount}}</div>
          <div class="swiper-slide">{{headInfo.blQty}}</div>
        </div>
      </div>
    </div>
    <r-scroll :options="scrollOptions" ref="bScroll">
      <div class="part-left">
        <div v-for="(item, index) in listData" :key="index" :class="{'bg-color':item.total}">
          <div class="content-item" :style="{paddingLeft:`${item.indent*.65}em`}" ref="partLeft">
            {{item.outPutMatCode_inventoryName}}
          </div>
        </div>
      </div>
      <div class="swiper-container part-right">
        <div class="swiper-wrapper box">
          <div class="swiper-slide div" style="width:50%">
            <div v-for="(item, index) in listData" :key="index">
              <div class="content-item" ref="partRightInit">
                {{item.initQty | formatNum}}
              </div>
            </div>
          </div>
          <div class="swiper-slide div" style="width:50%">
            <div v-for="(item, index) in listData" :key="index">
              <div class="content-item" ref="partRightFinal">
                {{item.blQty | formatNum}}
              </div>
            </div>
          </div>
          <div class="swiper-slide div" style="width:100%">
            <div v-for="(item, index) in listData" :key="index">
              <div class="content-item" ref="partRightYear">
                {{item.drAmount | formatNum}}
              </div>
            </div>
          </div>
          <div class="swiper-slide">
            <div v-for="(item, index) in listData" :key="index">
              <div class="content-item" ref="partRightYear2">
                {{item.crAmount | formatNum}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </r-scroll>
  </div>
</template>

<script>
  import {getPsiDataByViewId} from 'service/kmService'
  import RScroll from 'plugins/scroll/RScroll'
  import {toFixed} from '@/plugins/calc'
  import {accAdd} from "plugins/calc/decimalsAdd";
  import {numberComma,Datetime,Group,dateFormat,Flexbox, FlexboxItem} from 'vux'
  import {isPC,isQYWX,} from '@/plugins/platform/index'
  const storage = window[isPC||window.isApp ? 'localStorage' : 'sessionStorage'];
  const ROSE_TOKEN_KEY = 'ROSE_LOGIN_TOKEN';

  export default {
    name: "JXCForm",
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
          JXC: {
            title: '利润表',
            initQty: '期初数量',
            drAmount: '数量增加',
            crAmount: '数量减少',
            blQty: '期末数量',
            request: getPsiDataByViewId
          },
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
      Group,
      Flexbox, 
      FlexboxItem
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
        let entityId = JSON.parse(storage.getItem(ROSE_TOKEN_KEY)).entityId || {};
        var data = {
          _dc: Date.now(),
          strViewId: '63882579-5f7d-4708-b62c-89ba0c63f4e9',
          strEntityId: entityId,
          aryFilters: '',
          intStart: 0,
          intLimit: 50,
        };
        return this.listMap[this.code].request(data).then(res => {
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
          this.partRightSwiper.controller.control = this.headerSwiper;
          this.headerSwiper.controller.control = this.partRightSwiper;
          
        })
      },
    },
    filters: {
      // 格式化数字
      formatNum(num) {
        if (!num) return '-';
        return `${numberComma(num.toFixed(2))}`;
      }
    },
    created() {
      this.$loading.show();
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
    .title{
      font-size: .14rem;
      padding: .05rem;
    }
    .title2{
      font-size: .14rem;  
      padding: .05rem;
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
    /* 顶部期初、期末 */
    .swiper-container-header {
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
        .swiper-slide {
          width: 50%;
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
