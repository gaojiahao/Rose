<template>
  <div class="matter-item">
    <div class="mater_img">
      <img :src="matter.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
    </div>
    <div class="mater_main">
      <!-- 物料名称 -->
      <div class="mater_name">
        {{matter.inventoryName || matter.invName || matter.facilityName}}
        <span class="icon-matter-bianji" @click.stop="modifyMatter" v-if="!showDelete"></span>
      </div>
      <div class="matter_more">
        <div class="each_info" v-for="(cItem, cIndex) in config" :key="cIndex">
          <span class="title">{{cItem.text}}:</span>
          <span v-if="cItem.fieldCode && matter[cItem.fieldCode]">
            {{matter[cItem.fieldCode] != null && matter[cItem.fieldCode] !== "" ? matter[cItem.fieldCode] : "无"}}
          </span>
          <span v-else>
            {{matter[cItem.showFieldCode] != null && matter[cItem.showFieldCode] !== "" ? matter[cItem.showFieldCode] : "无"}}
          </span>
        </div>
      </div>
      <slot name="info" :item="item"></slot>
    </div>
  </div>
</template>

<script>
import { accMul } from '@/home/pages/maps/decimalsAdd'
export default {
  name: "MatterItem",
  filters: {
    percent(val) {
      if(!val && val !== 0) {
        return '无'
      }
      let budget = accMul(val, 100);
      return `${budget}%`;    
    }
  },
  props: {
    // 是否展示删除图标
    showDelete: {
      type: Boolean,
      default: false
    },
    // 展示数据
    item: {
      type: Object,
      default () {
        return {}
      }
    },
    config: {
      type: Array,
      default() {
        return []
      }
    }
  },
  watch: {
    item: {
      handler(val) {
        // 对父组件传进来的值 声明新的对象
        this.matter = {...this.item};
      },
      deep: true,
      immediate: true
    },
  },
  computed: {
    showEdit () {
      // 存在 价格、数量 输入
      if(this.matter.price || this.matter.tdQty){
        return this.matter.price || this.matter.tdQty
      }
    },
    hideEdit () {
      // 存在 价格、数量 输入
      if (this.matter.price === '' || this.matter.tdQty === '' || this.matter.price === 0 || this.matter.tdQty === 0) {
        return !this.matter.price || !this.matter.tdQty
      }
    }
  },
  data () {
    return {
      matter: {}
    }
  },
  methods: {
    // 选择默认图片
    getDefaultImg (item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 触发编辑事件
    modifyMatter () {
      this.$emit('on-modify', this.item);
    }
  }
}
</script>

<style scoped lang="scss">
  .matter-item {
    padding: .16rem 0;
    position: relative;
    display: flex;
    box-sizing: border-box;
    color: #333;
    font-size: .14rem;
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
      flex: 1;
      box-sizing: border-box;
    }
    // 物料名称
    .mater_name {
      padding-right: .28rem;
      line-height: .22rem;
      font-weight: bold;
      word-break: break-all;
      margin-bottom: .02rem;
      position: relative;
      .icon-matter-bianji {
        width: .28rem;
        height: .28rem;
        position: absolute;
        right: 0;
        top: .03rem;
      }
    }
    .matter_info_item {
      line-height: .20rem;
      font-size: .12rem; 
      .matter_detail{
        display: inline-block;
        margin-right: .08rem;
      }
    }
    .matter_item_title {
      color: #999;
    }
    // 物料信息
    .matter-info {
      $borderNum: .04rem;
      display: flex;
      color: #757575;
      font-size: .1rem;
      .title {
        color: #fff;
        padding: 0 .04rem;
        background: #3f72af;
        border-top-left-radius: $borderNum;
        border-bottom-left-radius: $borderNum;
      }
      .num {
        color: #111;
        overflow: hidden;
        max-width: .65rem;
        padding: 0 .04rem;
        white-space: nowrap;
        background: #dbe2ef;
        text-overflow: ellipsis;
        border-top-right-radius: $borderNum;
        border-bottom-right-radius: $borderNum;
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
    .matter_more {
      font-size: .12rem;
      .each_info {
        line-height: .2rem;
        display: inline-block;
        color: #333;
        margin-right: .08rem;
        .title {
          color: #999;
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
