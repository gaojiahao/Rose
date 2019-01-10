<template>
  <!--<div class="matter_item">
    <div class="mater_img">
      <img :src="item.inventoryPic" alt="mater_img" @error="getMatterDefault(item)">
    </div>
    <div class="mater_main">
      &lt;!&ndash; 物料名称 &ndash;&gt;
      <div class="mater_name">
        {{item.inventoryName_transObjCode || item.facilityName_facilityObjCode || '该物料未获取到名称，请检查物料信息。'}}
      </div>
      &lt;!&ndash; 物料基本信息 &ndash;&gt;
      <div class="mater_info">
        &lt;!&ndash; 物料编码 &ndash;&gt;
        <span class="info-item">
          编码: {{item.transObjCode || item.facilityObjCode || '无'}}
        </span>
        &lt;!&ndash; 物料规格 &ndash;&gt;
        <span class="info-item">
          规格: {{item.specification_transObjCode || item.specification_outPutMatCode || item.facilitySpecification_facilityObjCode || '无'}}
        </span>
      </div>
      <slot name="other" :item="item">
        &lt;!&ndash; 物料数量和价格 默认视图 如果父组件编写则此内容会被覆盖&ndash;&gt;
        <div class='mater_other'>
          <div class='mater_num' v-if='item.tdQty'>
            <span v-if="isReturnMatter">
              <span class="num">退货单价: ￥{{item.price | toFixed | numberComma(3)}}</span>
              <span class='num'>退货数量: {{item.tdQty | toFixed}}</span>
            </span>
            <span v-else>
              <span class="num">单价: ￥{{item.price | toFixed | numberComma(3)}}</span>
              <span class='num'>数量: {{item.tdQty | toFixed}}</span>
            </span>
            <span v-show='item.taxRate'>税率: {{item.taxRate}}</span>
          </div>
          <div class='mater_other' v-if="item.priceType || item.priceType === ''">
            <div class='mater_price'>
              <span class="symbol">￥</span>{{item.price | toFixed |numberComma(3)}}
              <span class="num">[类型: {{item.priceType || '无'}}]</span>
            </div>
          </div>
          <div class='mater_price' v-else>
            <span><span class="symbol">￥</span>{{item.tdAmount | toFixed | numberComma(3)}}</span>
            <span class="num"
                  :style="{display:(item.tdAmount && item.tdAmount.toString().length >= 5 ? 'block' : '')}"
                  v-if="item.taxRate">
              [金额: ￥{{item.noTaxAmount | toFixed | numberComma(3)}} + 税金: ￥{{item.taxAmount | toFixed | numberComma(3)}}]
            </span>
          </div>
        </div>
      </slot>
    </div>
  </div>-->

  <div class="matter-item-container">
    <div class="matter-main">
      <img class="matter_img" :src="item.inventoryPic" alt="mater_img" @error="getMatterDefault(item)">
      <div class="matter_info">
        <div class="matter_name">
          {{item.inventoryName_transObjCode || item.facilityName_facilityObjCode || '该物料未获取到名称，请检查物料信息。'}}
        </div>
        <div class="matter_info_item flex-start">
          <div class="matter_detail">
            <span class="matter_item_title">属性：</span>
            <span class="matter_item_value">{{item.tdProcessing}}</span>
          </div>
          <div class="matter_detail">
            <span class="matter_item_title">规格：</span>
            <span class="matter_item_value">{{item.specification_transObjCode || item.specification_outPutMatCode || item.facilitySpecification_facilityObjCode || '无'}}</span>
          </div>
        </div>
        <div class="matter_info_item">
          <div class="matter_detail">
            <span class="matter_item_title">编码：</span>
            <span class="matter_item_value">{{item.transObjCode || item.facilityObjCode || '无'}}</span>
          </div>
        </div>
        <div class="matter_info_item">
          <div class="matter_detail">
            <span class="matter_item_title">其他：</span>
            <span class="matter_item_value">含税税金</span>
          </div>
          <i class="icon-more"></i>
        </div>
        <div class="matter_info_item">
          <span class="matter_no_tax">￥{{item.noTaxAmount | toFixed | numberComma}}</span>
          <span class="matter_qty">x{{item.tdQty | toFixed}}</span>
        </div>
        <div class="matter_info_item">
          <span class="matter_tax">（含税费￥{{item.taxAmount | toFixed | numberComma}}）</span>
          <span class="matter_total_wrapper">
            合计：<span class="matter_total"><span class="symbol">￥</span>{{item.tdAmount | toFixed | numberComma}}</span>
          </span>
        </div>
      </div>
    </div>
    <div class="matter-more-wrapper">
      <div class="matter-more">
        <span>查看更多商品</span>
        <i class="icon-filter-down"></i>
      </div>
    </div>

    <div v-transfer-dom>
      <popup height="80%" v-model="showPop">
        111
      </popup>
    </div>
  </div>
</template>

<script>
  import {numberComma, Popup} from 'vux'
  import {toFixed} from '@/plugins/calc'

  export default {
    name: "MatterItem",
    props: {
      item: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    data() {
      return {
        showPop: false,
      }
    },
    components: {
      Popup,
    },
    methods: {
      //选择默认图片
      getMatterDefault(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
    },
    filters: {
      numberComma,
      toFixed,
    },
  }
</script>

<style scoped lang="scss">
  /*.vux-1px-b:after {
    border-color: #e8e8e8;
  }

  // 每个物料
  .matter_item {
    display: flex;
    position: relative;
    padding: .08rem 0;
    box-sizing: border-box;
    // 物料图片
    .mater_img {
      display: inline-block;
      margin-top: .04rem;
      width: .75rem;
      height: .75rem;
      > img {
        width: 100%;
        max-height: 100%;
        border-radius: .04rem;
      }
    }
    // 物料主体
    .mater_main {
      flex: 1;
      margin-left: .1rem;
      display: inline-block;
      box-sizing: border-box;
    }
    // 物料名称
    .mater_name {
      color: #111;
      overflow: hidden;
      font-size: .14rem;
      font-weight: bold;
      max-height: .46rem;
      display: -webkit-box;
      word-break: break-all;
      -webkit-line-clamp: 2;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
    }
    // 物料信息
    .mater_info {
      color: #4a4a48;
      font-size: .12rem;
      // margin-top: .02rem;
      // font-size: 0;
      // 物料编码和规格
      .info-item {

        margin-right: .06rem;
        .title, .num {
          font-size: .1rem;
          padding: .01rem .04rem;
        }
        .title {
          color: #fff;
          background: #3f72af;
          border-top-left-radius: .12rem;
          border-bottom-left-radius: .12rem;
        }
        .num {
          color: #111;
          max-width: .9rem;
          overflow: hidden;
          white-space: nowrap;
          background: #dbe2ef;
          text-overflow: ellipsis;
          border-top-right-radius: .12rem;
          border-bottom-right-radius: .12rem;
        }
        // 规格
        &.mater_spec {
          .title {
            background: #537791;
          }
          .num {
            color: #fff;
            max-width: .6rem;
            background: #ff7f50;
          }
        }
      }
    }
    //物料价格，数量
    .mater_other {
      margin-top: .02rem;
      // 类型
      .mater_spec {
        font-size: .14rem;
      }
      // 一般金额
      .mater_price {
        color: #ea5455;
        font-weight: bold;
        font-size: .16rem;
        line-height: 0.2rem;
        margin-top: .04rem;
        display: inline-block;
        .symbol {
          font-size: .12rem;
        }
        .num {
          font-size: .1rem;
          color: #757575;
        }
      }
      // 单价 数量 税率 等
      .mater_attribute {
        color: #3f72af;
        font-size: 0.1rem;
        word-break: keep-all;
        span {
          padding: 0 .04rem;
          border-radius: .04rem;
          background: #deecfc;
        }
        .num {
          margin-right: 0.04rem;
        }
      }
    }
    .mater_other {
      .mater_left {
        color: #757575;
        font-size: .1rem;
        .units {
          margin-right: .04rem;
        }
      }
      .mater_num {
        .num {
          color: #111;
          font-size: .12rem;
          font-weight: bold;

        }
        .symbol {
          color: #757575;
        }
        .num + .num {
          margin-left: .04rem;
        }
        .units {
          font-size: .1rem;
        }
      }
    }
  }*/

  .matter-item-container {
    padding: .15rem;
    color: #333;
    .matter-main {
      display: flex;
    }
    .matter_img {
      width: .9rem;
      height: .9rem;
    }

    .matter_info {
      flex: 1;
      margin-left: .12rem;
    }
    .matter_name {
      line-height: .24rem;
      font-size: .16rem;
      font-weight: 500;
    }
    .matter_info_item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: .16rem;
      line-height: .12rem;
      font-size: .12rem;
      & + .matter_info_item {
        margin-top: .08rem;
      }
      &.flex-start {
        justify-content: flex-start;
        .matter_detail {
          &:last-child {
            margin-left: .1rem;
          }
        }
      }
    }
    .matter_detail {
      display: flex;
    }
    .matter_item_title {
      color: #999;
    }
    .icon-more {
      display: inline-block;
      width: .18rem;
      height: .04rem;
    }
    .matter_no_tax {
      margin-top: .1rem;
      font-size: .14rem;
      font-weight: bold;
    }
    .matter_qty {
      color: #999;
    }
    .matter_tax {
      margin-left: -.05rem;
      color: #999;
    }
    .matter_total_wrapper {
      color: #696969;
    }
    .matter_total {
      line-height: .16rem;
      color: #FA7138;
      font-size: .18rem;
      font-weight: bold;
    }
    .symbol {
      font-size: .12rem;
    }

    .matter-more-wrapper {
      display: flex;
      justify-content: center;
      margin-top: .24rem;
      .matter-more {
        display: flex;
        align-items: center;
        padding: .1rem .15rem;
        line-height: .14rem;
        border: 1px solid rgba(151, 151, 151, 1);
        border-radius: .17rem;
        font-size: .14rem;
      }
      .icon-filter-down {
        display: inline-block;
        margin-left: .05rem;
        width: .11rem;
        height: .05rem;
      }
    }
  }
</style>
