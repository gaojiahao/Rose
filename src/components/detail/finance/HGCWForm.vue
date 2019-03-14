<template>
  <div class="detail_wrapper">
    <div class="header">
      <div class="title">{{headInfo.title}}</div>
      <div class="swiper-container swiper-container-header">
        <div class="swiper-wrapper">
          <div class="swiper-slide">{{headInfo.firstName}}</div>
          <div class="swiper-slide">{{headInfo.LastName}}</div>
        </div>
      </div>
    </div>
    <r-scroll :options="scrollOptions" ref="bScroll">
      <div class="part-left">
        <div v-for="(item, index) in listData" :key="index">
          <div class="title border-1px-t border-1px-b" v-if="item.assetType"
               ref="partLeftTitle">{{item.assetType}}
          </div>
          <div class="content-item"
               :class="{'final-total': lItem.isTotal,
                 'border-1px-t': lItem.isTotal,
                 'is-first': lItem.bigSubject,
                 'indent': lItem.bigSubject !== undefined && !lItem.bigSubject && !lItem.subjectName.includes(': ')}"
               v-for="(lItem, lIndex) in item.items" :key="lIndex" ref="partLeftContent">
            {{lItem.subjectName}}
          </div>
        </div>
      </div>
      <div class="swiper-container part-right">
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div v-for="(item, index) in listData" :key="index">
              <div class="title" v-if="item.assetType" ref="partRightInitTitle"></div>
              <div class="content-item"
                   :class="{'final-total': lItem.isTotal, 'is-first': lItem.bigSubject}"
                   v-for="(lItem, lIndex) in item.items" :key="lIndex" ref="partRightInit">
                {{lItem.initialBalance | formatNum}}
              </div>
            </div>
          </div>
          <div class="swiper-slide">
            <div v-for="(item, index) in listData" :key="index">
              <div class="title" v-if="item.assetType" ref="partRightFinalTitle"></div>
              <div class="content-item"
                   :class="{'final-total': lItem.isTotal, 'is-first': lItem.bigSubject}"
                   v-for="(lItem, lIndex) in item.items" :key="lIndex" ref="partRightFinal">
                {{lItem.finalBalance | formatNum}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </r-scroll>
  </div>
</template>

<script>
  import {getOffBalance, getProfit} from 'service/kmService'
  import RScroll from 'plugins/scroll/RScroll'
  import {toFixed} from '@/plugins/calc'
  import {accAdd} from "plugins/calc/decimalsAdd";
  import {numberComma} from 'vux'

  export default {
    name: "ZCFZForm",
    data() {
      return {
        headerSwiper: null,         // 顶部swiper
        partRightSwiper: null,      // 右侧金额swiper
        code: '',                   // 路由参数
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
            firstName: '上期',
            LastName: '本期',
            request: getProfit
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
    },
    methods: {
      // 获取资产负债表数据
      getData() {
        return this.listMap[this.code].request().then(res => {
          let {data = []} = res;
          let tmp = {};
          // 组装数据
          data.forEach(item => {
            let matchedObj = tmp[item.assetType];
            if (matchedObj) {
              matchedObj.items.push(Object.freeze(item));
            } else {
              tmp[item.assetType] = {
                assetType: item.assetType,
                items: [Object.freeze(item)]
              }
            }
          });

          this.listData = tmp;
          this.$nextTick(() => {
            // 设置金额行高度，判断高度是否与title相同，不相同则设置为title的高度
            this.setHeight(this.$refs.partLeftContent, this.$refs.partRightInit, this.$refs.partRightFinal);
            if (this.code === 'ZCFZ') {
              // 设置标题高度，判断高度是否与title相同，不相同则设置为title的高度
              this.setHeight(this.$refs.partLeftTitle, this.$refs.partRightInitTitle, this.$refs.partRightFinalTitle);
            }
            this.$loading.hide();
          })
        })
      },
      // 设置高度
      setHeight(left, ...right) {
        let [first] = right;
        left && left.forEach((item, index) => {
          let initialItem = first[index];

          // 判断高度是否与title相同，不相同则设置为title的高度
          if (item.clientHeight !== initialItem.clientHeight) {
            right.forEach(rItem => {
              rItem[index].style.height = `${item.clientHeight}px`;
            });
          }
        });
      },
      // 初始化swiper
      initSwiper() {
        this.$nextTick(() => {
          this.partRightSwiper = new this.Swiper('.part-right');
          this.headerSwiper = new this.Swiper('.swiper-container-header');
          this.partRightSwiper.controller.control = this.headerSwiper;
          this.headerSwiper.controller.control = this.partRightSwiper;
        })
      }
    },
    filters: {
      // 格式化数字
      formatNum(num) {
        if (!num) {
          return '-'
        }
        return `${numberComma(toFixed(num))}元`
      }
    },
    created() {
      let {code = ''} = this.$route.query;
      this.code = code;
      // 获取表格的表头信息
      this.headInfo = { ...this.listMap[code] };
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

    /* 头部 */
    .header {
      display: flex;
      justify-content: space-between;
      padding: .05rem .15rem;
      width: 100%;
      height: .3rem;
      line-height: .2rem;
      box-sizing: border-box;
    }
    /* 顶部期初、期末 */
    .swiper-container-header {
      margin: 0;
      width: 50%;
      height: 100%;
      text-align: right;
    }

    .scroll-container {
      height: calc(100% - .3rem);
      font-size: 0;
    }
    /deep/ .scroll-wrapper {
      display: flex;
    }
    .part-left, .part-right {
      width: 50%;
      font-size: .14rem;
      /* 标题 */
      .title {
        padding: .05rem .15rem;
        min-height: .4rem;
        line-height: .3rem;
        font-size: .18rem;
        font-weight: bold;
        box-sizing: border-box;
      }
      .content-item {
        position: relative;
        padding: .05rem .15rem;
        width: 100%;
        line-height: .2rem;
        box-sizing: border-box;

        /* 资产合计 */
        &.final-total {
          line-height: .3rem;
          font-size: .16rem;
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
    .part-right {
      text-align: right;
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
