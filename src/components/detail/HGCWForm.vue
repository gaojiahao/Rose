<template>
  <div class="detail_wrapper">
    <div class="header">
      <div class="title">{{title}}</div>
      <div class="swiper-container swiper-container-header">
        <div class="swiper-wrapper">
          <div class="swiper-slide">期初</div>
          <div class="swiper-slide">期末</div>
        </div>
      </div>
    </div>
    <r-scroll :options="scrollOptions" ref="bScroll">
      <div class="part-left">
        <div v-for="(item, index) in listData" :key="index">
          <div class="title vux-1px-t vux-1px-b" v-if="item.assetType">{{item.assetType}}</div>
          <div class="content-item"
               :class="{'final-total': lItem.isFinal,
                 'border-1px-t': lItem.isFinal || lItem.isTotal,
                 'is-first': lItem.bigSubject,
                 'indent': lItem.bigSubject !== undefined && !lItem.bigSubject && !lItem.subjectName.includes('：')}"
               v-for="(lItem, lIndex) in item.items" :key="lIndex" ref="partLeftContent">
            {{lItem.subjectName}}
          </div>
        </div>
      </div>
      <div class="swiper-container part-right">
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div v-for="(item, index) in listData" :key="index">
              <div class="title" v-if="item.assetType"></div>
              <div class="content-item"
                   :class="{'final-total': lItem.isFinal, 'is-first': lItem.bigSubject}"
                   v-for="(lItem, lIndex) in item.items" :key="lIndex" ref="partRightInit">
                {{lItem.initialBalance | formatNum}}
              </div>
            </div>
          </div>
          <div class="swiper-slide">
            <div v-for="(item, index) in listData" :key="index">
              <div class="title" v-if="item.assetType"></div>
              <div class="content-item"
                   :class="{'final-total': lItem.isFinal, 'is-first': lItem.bigSubject}"
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
  import RScroll from 'components/RScroll'
  import {toFixed} from '@/plugins/calc'
  import {accAdd} from "@/home/pages/maps/decimalsAdd";
  import {numberComma} from 'vux'

  export default {
    name: "ZCFZForm",
    data() {
      return {
        listData: {},
        partRightSwiper: null, // 右侧金额swiper
        headerSwiper: null, // 顶部swiper
        scrollOptions: {
          bounce: {
            top: false
          }
        },
        title: '',
        code: '',
        listMap: {
          ZCFZ: {
            title: '资产负债表',
            request: getOffBalance,
          },
          LR: {
            title: '利润表',
            request: getProfit,
          },
        }
      }
    },
    components: {
      RScroll,
    },
    methods: {
      // TODO 获取资产负债表数据
      getData() {
        return this.listMap[this.code].request().then(res => {
          let {data = []} = res;
          let tmp = {};
          let initialTotal = 0;
          let finalTotal = 0;
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

          // 生成汇总数据
          let tArr = Object.values(tmp);
          tArr.forEach((tItem, tIndex) => {
            let initial = 0; // 当前类别期初合计项
            let final = 0; // 当前类别期末合计项

            // 计算合计项
            tItem.items.forEach(item => {
              initial = accAdd(initial, item.initialBalance);
              final = accAdd(final, item.finalBalance);
            });
            initialTotal = accAdd(initialTotal, initial);
            finalTotal = accAdd(finalTotal, final);

            // 设置合计项
            tItem.assetType && tItem.items.push(Object.freeze({
              subjectName: `${tItem.assetType}合计`,
              isTotal: true,
              initialBalance: initial,
              finalBalance: final,
            }));

            // 设置资产合计
            if (tItem.assetType && tIndex === tArr.length - 1) {
              tItem.items.push(Object.freeze({
                subjectName: '资产合计',
                isFinal: true, // 总合计
                initialBalance: initialTotal,
                finalBalance: finalTotal,
              }));
            }
          });
          this.listData = tmp;
          this.$nextTick(() => {
            let partLeft = this.$refs.partLeftContent;
            let partRightInit = this.$refs.partRightInit; // 期初
            let partRightFinal = this.$refs.partRightFinal; // 期末
            partLeft && partLeft.forEach((item, index) => {
              let initialItem = partRightInit[index];

              // 判断高度是否与title相同，不相同则设置为title的高度
              if (item.clientHeight !== initialItem.clientHeight) {
                initialItem.style.height = `${item.clientHeight}px`;
                partRightFinal[index].style.height = `${item.clientHeight}px`;
              }
            });
            this.$loading.hide();
          })
        })
      },
      // TODO 初始化swiper
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
      this.title = this.listMap[code].title;
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
    width: 200%;
    border-top: 1px solid #C7C7C7;
    color: #C7C7C7;
    transform-origin: 0 0;
    transform: scaleY(0.5);
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
      .title {
        padding: 0 .15rem;
        width: 200%;
        height: .4rem;
        line-height: .4rem;
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
          height: .4rem;
          line-height: .3rem;
          font-size: .16rem;
          font-weight: bold;
        }

        /* 利润表首行 */
        &.is-first {
          height: .4rem;
          line-height: .3rem;
          font-size: .2rem;
          font-weight: bold;
        }
      }
    }
    .part-left {
      .content-item {
        &.border-1px-t {
          &:before {
            @extend %border-1px;
            top: 0;
          }
        }
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
  }
</style>
