<template>
  <!-- bom列表 -->
  <div class="bom_list" v-if="bomList && bomList.length">
    <div class="bom-container">
      <div class="title vux-1px-b">bom</div>
      <div class="each-bom-part" :class="{'vux-1px-b' : bIndex<boms.length-1}" v-for="(bom, bIndex) in bomList" :key="bIndex" v-show="showAllBoms || bIndex < 3">
        <div class="main-info-part">
          <div class="main-top" v-if="bom.warehouseName || bom.warehouseCode">
            <span class="content-title" v-if="bom.warehouseName">{{bom.warehouseName}}</span>
            <span class="side-bar vux-1px-r" v-if="bom.warehouseName"></span>
            <span class="content-info" v-if="bom.warehouseCode">{{bom.warehouseCode}}</span>
          </div>
          <div class="main-content">
            <div class="content-unit">
              <span class="iconfont icon-bianma"></span>
              <span>物料编码: {{bom.inventoryCode}}</span>
            </div>
            <div class="content-name">
              {{bom.inventoryName}}
            </div>
            <slot name="specification" :bom="bom">
            </slot>
          </div>
        </div>
        <slot :bom="bom" name="number">
          <div class="number-part">
            <span class="main-number">Bom需求: {{bom.tdQty}}{{bom.measureUnit}}</span>
            <span class="number-unit">在库可用: {{bom.qtyStock}}</span>
            <span class="number-unit" @click="showBomInfo(bom, bIndex)"><i class="icon-more"></i></span>
          </div>
        </slot>
      </div>
      <div class="matter-more-wrapper" v-show="bomList.length > 3 && !showAllBoms">
        <div class="matter-more" @click="clickMore('')">
          <span>更多</span>
          <i class="icon-filter-down"></i>
        </div>
      </div>
    </div>
    <!--bom pop-->
    <bom-pop :show="bomPopShow" :bomInfo="bomDetail" v-model="bomPopShow" class="bom_pop" :is-edit="false">
    </bom-pop>
  </div>
</template>

<script>
import Vue from 'vue';
import BomPop from 'components/apply/commonPart/BomPop'

  var component = {
    name: "BomListView",
    props: {
      boms: {
        type: Array,
        default() {
          return []
        }
      }
    },
    data() {
      return {
        bomList: [],
        showAllBoms: false,
        bomPopShow: false,
        bom: {},
        isEdit: false,
        bomDetail: {},
        bomPopShowIndex: 0,
        bomPopShowKey:0
      }
    },
    components: {
      BomPop,
    },
    watch: {
      boms:{
        handler(val) {
          this.getBomList(val);
        }
      }
    },
    methods: {
      getBomList(val) {
        for (let bom of val) {
          bom.inventoryCode = bom.transObjCode;
          bom.warehouseName = bom.warehouseName_containerCodeOut;
          bom.warehouseCode = bom.containerCodeOut; 
          bom.tdQty = bom.demandQty;
          bom.inventoryCode = bom.outPutMatCode;
          bom.inventoryName = bom.inventoryName_outPutMatCode;
          bom.qtyStock = bom.thenQtyStock;
          this.bomList.push(bom);
        }
      },
      showBomInfo(item, index, key) {
        this.bomDetail = JSON.parse(JSON.stringify(item));
        this.bomPopShow = true;
        this.bomPopShowIndex = index;
        if (key) {
          this.bomPopShowKey = key;
        }
      },
      clickMore(key) {
        this.showAllBoms = true;
      },
    },
    created () {
    }
  }
  export default Vue.component('BomListView',component)
</script>

<style scoped lang="scss">
  .bom_list {
    margin: .1rem .1rem 0;  
    position: relative;
    background: #FFF;
    padding: .06rem .08rem;
    margin-top: 0.1rem; 
  }
  /* 原料 */
  .bom-container {
    width: 100%;
    .title {
      padding-bottom: .02rem;
      color: #757575;
      font-size: .12rem;
    }
    .each-bom-part {
      width: 100%;
      display: flex;
      padding: .06rem 0;
      align-items: center;
      box-sizing: border-box;
      .main-info-part {
        flex: 2;
        .main-top {
          font-size: 0;
          display: flex;
          align-items: center;
          padding-bottom: .02rem;
          .content-title {
            color: #005792;
            font-size: .1rem;
            font-weight: bold;
          }
          .side-bar {
            height: .1rem;
            margin: 0 .04rem;
            display: inline-block;
          }
          .content-info {
            @extend .content-title;
          }
        }
        .main-content {
          .content-unit {
            color: #757575;
            font-size: .1rem;
            word-break: break-all;
            .icon-bianma {
              font-size: .1rem;
            }
          }
          .content-name {
            font-size: .12rem;
            font-weight: bold;
            word-break: break-all;
          }
        }
      }
      .number-part {
        flex: 1;
        display: flex;
        font-size: .1rem;
        text-align: right;
        flex-direction: column;
        .main-number {
          font-size: .12rem;
          font-weight: bold;
        }
        .number-unit {
          color: #757575;
        }
      }
    }
    .vux-1px-b:after {
      border-bottom: 1px solid #e8e8e8;
    }
    .matter-more-wrapper {
      display: flex;
      justify-content: center;
      .matter-more {
        display: flex;
        font-size: .14rem;
        align-items: center;
        line-height: .14rem;
        padding: .1rem .15rem;
        border-radius: .17rem;
        border: 1px solid rgba(151, 151, 151, 1);
        margin-top: .05rem;
      }
      .icon-filter-down {
        width: .11rem;
        height: .05rem;
        margin-left: .05rem;
        display: inline-block;
      }
    }
  }
  .icon-more {
      display: inline-block;
      width: .18rem;
      height: .04rem;
    }
</style>
