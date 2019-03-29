<template>
  <!-- 单个物料 (嵌套于matterList中) -->
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
            <span class="matter_item_value">{{item.tdProcessing || '无'}}</span>
          </div>
          <div class="matter_detail">
            <span class="matter_item_title">产品规格：</span>
            <!-- <span class="matter_item_value">{{item.specification_transObjCode || item.specification_outPutMatCode || item.facilitySpecification_facilityObjCode || item.assMeasureDescription}}</span> -->
            <span class="matter_item_value">{{item.specification_transObjCode || '无'}}</span>
          </div>
        </div>
        <div class="matter_info_item">
          <div class="matter_detail">
            <span class="matter_item_title">编码：</span>
            <span class="matter_item_value">{{item.transObjCode || item.facilityObjCode || '无'}}</span>
          </div>
        </div>
        <div class="matter_info_item" @click="clickMore">
          <div class="matter_detail">
            <span class="matter_item_title">其他</span>
          </div>
          <i class="icon-more"></i>
        </div>
        <div class="matter_info_item matter_price_top" v-if="hasData('price') || hasData('assistQty')">
          <span class="matter_no_tax" v-if="hasData('price')">￥{{item.price | toFixed | numberComma}}</span>
          <span class="matter_qty" v-if="item.assistQty">x{{item.assistQty | toFixed}}</span>
        </div>
        <div class="matter_info_item" :class="{spillover: `${item.tdAmount}`.length > 6}"
             v-if="hasData('taxAmount') || item.tdAmount">
          <span class="matter_tax" v-if="hasData('taxAmount')">税金￥{{item.taxAmount | toFixed | numberComma}}</span>
          <span class="matter_total_wrapper" v-if="item.tdAmount">
            合计：<span class="matter_total"><span class="symbol">￥</span>{{item.tdAmount | toFixed | numberComma}}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {numberComma} from 'vux'
  import {toFixed} from '@/plugins/calc'
  import PopMatterDetail from 'components/Popup/matter/PopMatterDetail'

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
    components: {
      PopMatterDetail,
    },
    data() {
      return {
        showPop: true,
      }
    },
    computed: {
      // 是否显示 产品规格
      showSpec() {
        let item = this.item;
        let spec = item.specification_transObjCode || item.specification_outPutMatCode || item.facilitySpecification_facilityObjCode || item.assMeasureDescription ;
        return !!spec;
      }
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
      // 点击查看更多
      clickMore() {
        this.$emit('on-show-more', this.item);
      },
      // 判断是否没有数据
      hasData(key) {
        let val = this.item[key];
        return !!val
      },
    },
    filters: {
      numberComma,
      toFixed,
    },
  }
</script>

<style scoped lang="scss">
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
        margin-top: .12rem;
      }
      &.flex-start {
        justify-content: flex-start;
        .matter_detail {
          & + .matter_detail {
            margin-left: .1rem;
          }
        }
      }
      /* 合计金额过多时 */
      &.spillover {
        align-items: flex-end;
        flex-direction: column-reverse;
        .matter_tax {
          margin-top: .04rem;
        }
      }
      &.matter_price_top {
        margin-top: .16rem;
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
      font-size: .14rem;
      font-weight: bold;
    }
    .matter_qty {
      color: #999;
    }
    .matter_tax {
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
  }
</style>
