<template>
  <div class="matter_item">
    <div class="mater_img">
      <img :src="require('@/assets/wl_default.png')" alt="mater_img" @error="getMatterDefault(item)">
    </div>
    <div class="mater_main">
      <!-- 物料名称 -->
      <div class="mater_name">
        {{item.INVENTORY_NAME || '该物料未获取到名称，请检查物料信息。'}}
      </div>
      <!-- 物料基本信息 -->
      <div class="mater_info">
        <!-- 物料编码 -->
        <div class="info-item">
          <span class="title">编码</span>
          <span class="num">{{item.TRANS_OBJ_CODE || '无'}}</span>
        </div>
        <!-- 物料规格 -->
        <div class="info-item mater_spec">
          <span class="title">规格</span>
          <span class="num">{{item.SPECIFICATION || '无'}}</span>
        </div>
      </div>
      <slot name="other" :item="item">
        <!-- 物料数量和价格 -->
        <div class='mater_other' v-if="!$slots.other && !$scopedSlots.other">
          <div class='mater_num'>
            <span class="num">类型: {{item.inventoryTypeName || '无'}}</span>
            <span class='num'>子类: {{item.inventorySubName || '无'}}</span>
            <span class='num'>材质: {{item.MATERIAL || '无'}}</span>
            <span class='num'>金标重: {{item.AU_STANDARD_WEIGHT || '无'}}</span>
            <span class='num'>银标重: {{item.AG_STANDARD_WEIGHT || '无'}}</span>
            <span class='num'>件标重: {{item.PIECES_STANDARD_WEIGHT || '无'}}</span>
            <span class='num'>单位: {{item.MEASURE_UNIT || '无'}}</span>
            <span class='num'>出库数量: {{item.QTY || '无'}}</span>
            <span class='num'>出库重量: {{item['出库重量'] || '无'}}</span>
          </div>
          <div class='mater_other'>
            <div class='mater_price' v-for="amt in amtList" v-if="item[amt] || item[amt] === 0">
              <span class="symbol">￥</span>{{item[amt] | toFixed |numberComma(3)}}
              <span class="num">[{{amt}}]</span>
            </div>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
  import {numberComma} from 'vux'
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
      //是否退货
      isReturnMatter: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        amtList: ['标准供货单价', '供货单价', '供货金额', '标准零售单价', '零售单价', '零售金额', '销售单价', '销售金额', '销项税额', '税价合计', '每克销售单价'],
      }
    },
    filters: {
      numberComma,
      toFixed,
    },
    methods: {
      //选择默认图片
      getMatterDefault(item) {
        let url = require('@/assets/wl_default.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
  .vux-1px-b:after {
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
      }
    }
    // 物料主体
    .mater_main {
      width: 2.6rem;
      margin-left: .1rem;
      display: inline-block;
      box-sizing: border-box;
    }
    // 物料名称
    .mater_name {
      overflow: hidden;
      display: -webkit-box;
      max-height: .46rem;
      color: #111;
      font-size: .14rem;
      font-weight: bold;
      -webkit-line-clamp: 2;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
    }
    // 物料信息
    .mater_info {
      margin-top: .02rem;
      color: #757575;
      font-size: 0;
      // 物料编码和规格
      .info-item {
        display: inline-block;
        margin-right: .06rem;
        margin-bottom: .05rem;

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
      // 类型
      .mater_spec {
        font-size: .14rem;
      }
      // 一般金额
      .mater_price {
        margin-right: .04rem;
        color: #ea5455;
        font-weight: bold;
        font-size: .14rem;
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
      .mater_num {
        color: #757575;
        font-size: 0.1rem;
        .num {
          margin-right: 0.04rem;
        }
      }
    }
  }
</style>
