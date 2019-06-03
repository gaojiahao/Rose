<template>
  <!-- 单个物料 (嵌套于matterList中) -->
  <div class="matter-item-container" v-if="item.inventoryName_transObjCode || item.facilityName_facilityObjCode">
    <!-- <div class="order_code">
      <span class="order_num">{{item.transCode || item.transMatchedCode}}&nbsp;</span>
    </div> -->
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
            <span class="matter_item_value">{{item.specification_transObjCode || item.specification_outPutMatCode || item.assMeasureDescription || '无'}}</span>
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
  <div class="matter-item-container" v-else>
    <div class="matter-main">
      <div class="matter_info_item2">
          <div class="matter_detail2">
            <template v-for="(citem, index) in columns">
              <span class="matter_item_title" :key="index" v-if=" index < 5">{{ citem.text }}:</span>
              <span class="matter_item_value2" v-if=" index < 5">{{ item[citem.fieldCode] || '无'}}</span>
            </template>
            <i class="icon-more" @click="clickMore" v-if="columns.length >=5"></i>
          </div>
        </div>
    </div>  
  </div>
</template>

<script>
  import {numberComma} from 'vux'
  import {toFixed} from '@/plugins/calc'
  import Vue from 'vue';
  var component = {
    name: "MatterItem",
    props: {
      item: {
        type: Object,
        default() {
          return {}
        }
      },
      columns: {
        type: Array,
        default() {
          return []
        }
      },
    },
    components: {
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
      getDefaultImg(){
        this.item.inventoryPic = this.item.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${this.item.inventoryPic_transObjCode}&width=400&height=400`
              : this.getMatterDefault();
      }
    },
    filters: {
      numberComma,
      toFixed,
    },
    created () {
      this.getDefaultImg();
    }
  }
  export default Vue.component('MatterItem',component)
</script>

<style scoped lang="scss">
  .matter-item-container {
    padding: 0 0.15rem 0.15rem 0.15rem;
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
      //line-height: .24rem;
      font-size: .14rem;
      font-weight: 500;
    }
    .matter_info_item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: .05rem;
      line-height: .12rem;
      font-size: .12rem;
      & + .matter_info_item {
        margin-top: .05rem;
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
        margin-top: .05rem;
      }
    }
    .matter_info_item2 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: .05rem;
      line-height: .22rem;
      font-size: .12rem;  
      .matter_item_value2{
        margin-right: 0.05rem;
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
  .order_code {
      display: flex;
      position: relative;
      line-height: .16rem;
      color: #999;
      font-size: .12rem;
      > span {
        display: inline-block;
      }
      .order_num {
        position: relative;
        &:before {
          top: 0;
          bottom: 0;
          content: " ";
          width: .08rem;
          left: -.15rem;
          color: #3296FA;
          position: absolute;
          transform-origin: 0 0;
          transform: scaleX(0.5);
          border-left: .08rem solid #3296FA;
        }
      }
      // 订单号
      // .order_num {
      //   //color: #696969;
      //   color: #3296FA;
      // }
    }
</style>
