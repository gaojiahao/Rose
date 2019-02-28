<template>
  <div class="bom-container" v-if="boms && boms.length">
    <div class="title vux-1px-b">bom</div>
    <div class="each-bom-part" :class="{'vux-1px-b' : bIndex<boms.length-1}" v-for="(bom, bIndex) in boms" :key="bIndex">
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
          <span class="main-number">本次扣料: {{bom.tdQty}}{{bom.measureUnit}}</span>
          <span class="number-unit">可用余额: {{bom.qtyStock}}</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: "BomList",
    props: {
      boms: {
        type: Array,
        default() {
          return []
        }
      }
    }
  }
</script>

<style scoped lang="scss">
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
  }
</style>
