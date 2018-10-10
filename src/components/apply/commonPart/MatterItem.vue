<template>
  <div class="matter-item">
    <div class="mater_img">
      <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
    </div>
    <div class="mater_main" :class="{'no-edit': noEdit, 'show-delete': showDelete}">
      <!-- 物料名称 -->
      <div class="mater_name">
        {{item.inventoryName}}
      </div>
      <!-- 物料基本信息 -->
      <div class="matter-info">
        <!-- 物料编码 -->
        <div class="matter-info-item">
          <span class="title">编码</span>
          <span class="num">{{item.inventoryCode}}</span>
        </div>
        <!-- 物料规格 -->
        <div class="matter-info-item matter-spec">
          <span class="title">规格</span>
          <span class="num">{{item.specification || '无'}}</span>
        </div>
      </div>
      <slot name="info" :item="item">
        <!-- 物料属性和单位 -->
        <div class='matter-more'>
          <span class='unit'>属性: {{item.processing}}</span>
          <span class='unit'>单位: {{item.measureUnit}}</span>
          <span class='mater_color'>颜色: {{item.inventoryColor || "无"}}</span>
          <span class='mater_color' v-if="item.taxRate">税率: {{item.taxRate}}</span>
        </div>
      </slot>
      <slot name="edit" :item="item">
        <div class='mater_other' @click="modifyMatter" v-if="(!item.price || !item.tdQty) && !showDelete">
          <div class="edit_tips" >点击编辑</div>
        </div>
      </slot>  
      <!-- 编辑图标 -->
      <div class="edit-part vux-1px-l" @click="modifyMatter" v-if="!noEdit" v-show="!showDelete">
        <span class='iconfont icon-bianji1'></span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "MatterItem",
    props: {
      // 是否展示删除图标
      showDelete: {
        type: Boolean,
        default: false
      },
      // 展示数据
      item: {
        type: Object,
        default() {
          return {}
        }
      },
      // 是否展示编辑图标
      noEdit: {
        type: Boolean,
        default: false
      },
    },
    data() {
      return {}
    },
    methods: {
      // TODO 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 触发编辑事件
      modifyMatter() {
        this.$emit('on-modify', this.item);
      }
    }
  }
</script>

<style scoped lang="scss">
  .matter-item {
    position: relative;
    display: flex;
    padding: .08rem 0;
    box-sizing: border-box;
    // 物料图片
    .mater_img {
      width: .75rem;
      height: .75rem;
      display: inline-block;
      margin-top: .04rem;
      img {
        width: 100%;
        max-height: 100%;
      }
    }
    // 物料主体
    .mater_main {
      display: inline-block;
      margin-left: .1rem;
      padding-right: .38rem;
      width: 2.6rem;
      box-sizing: border-box;
      &.no-edit {
        padding-right: 0;
        .num {
          max-width: .9rem;
        }
      }
      &.show-delete {
        padding-right: 0;
      }
    }
    // 物料名称
    .mater_name {
      color: #111;
      font-size: .14rem;
      font-weight: bold;
      margin-bottom: .02rem;
    }
    // 物料信息
    .matter-info {
      display: flex;
      color: #757575;
      font-size: .1rem;
      .title {
        padding: 0 .04rem;
        border-top-left-radius: .12rem;
        border-bottom-left-radius: .12rem;
        color: #fff;
        background: #3f72af;
      }
      .num {
        max-width: .65rem;
        padding: 0 .04rem;
        border-top-right-radius: .12rem;
        border-bottom-right-radius: .12rem;
        background: #dbe2ef;
        color: #111;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      // 物料编码、规格
      .matter-info-item {
        display: flex;
        margin-right: .1rem;
        &:last-child {
          margin-right: 0;
        }
      }
      // 规格
      .matter-spec {
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
    //物料单价，属性，颜色
    .matter-more {
      margin-top: .02rem;
      color: #757575;
      font-size: 0.1rem;
      > span {
        display: inline-block;
        margin-right: 0.04rem;
        .mater_color {
          margin-right: 0;
        }
      }
    }
    //可编辑提示
    .mater_other {
        display: flex;
        margin-top: .03rem;
        align-items: center;
        position: relative;
        justify-content: space-between;
        //内容可编辑提示
        .edit_tips{
          font-weight: bold;
          font-size:0.12rem;
          color: #111;
        }
        .mater_price {
          color: #ea5455;
          font-weight: bold;
          font-size: .16rem;
          line-height: .2rem;
          display: inline-block;
        }
        .matter-remain {
          color: #111;
          font-size: .14rem;
          font-weight: bold;
          .symbol {
            color: #757575;
          }
        }
    }
    // 物料的补充填写按钮
    .edit-part {
      top: 50%;
      right: -3%;
      width: .4rem;
      text-align: center;
      position: absolute;
      transform: translate(0, -50%);
      .icon-bianji1 {
        color: #454545;
      }
    }
  }

</style>
