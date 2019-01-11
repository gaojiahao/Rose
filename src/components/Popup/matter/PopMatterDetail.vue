<template>
  <div v-transfer-dom>
    <popup class="popup-matter-container" height="80%" v-model="showPop">
      <div class="popup-top">
        <i class="icon-close" @click="hidePop"></i>
      </div>
      <header class="popup-header">物料信息</header>
      <r-scroll ref="bScroll">
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
          </div>
        </div>
        <div class="matter-other">
          <div class="matter_other_item" v-for="other in item.others">
            <span class="matter_other_title">{{other.text}}</span>
            <span>{{other.value}}</span>
          </div>
        </div>
        <div class="matter-date vux-1px-t" v-if="hasDate">
          <div class="matter_date_item" v-for="date in item.dates">
            <span class="matter_date_title">{{date.text}}：</span>
            <span>{{date.value}}</span>
          </div>
        </div>
        <div class="matter-comment" :class="{'vux-1px-t': !hasDate}"
             v-if="item.matterComment && item.matterComment.text">
          <div class="matter_comment_title">{{item.matterComment.text}}</div>
          <div class="matter_comment_value">{{item.matterComment.value}}</div>
        </div>
      </r-scroll>
    </popup>
  </div>
</template>

<script>
  import {numberComma, Popup} from 'vux'
  import RScroll from 'components/RScroll'

  export default {
    name: "PopMatterDetail",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      item: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    components: {
      Popup, RScroll,
    },
    data() {
      return {
        showPop: false,
      }
    },
    computed:{
      // 是否含时间块
      hasDate(){
        let {dates = []} = this.item;
        return dates && dates.length
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        },
        immediate: true
      },
      showPop: {
        handler(val) {
          this.$emit('input', val);
        },
        immediate: true
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
      // TODO 隐藏弹窗
      hidePop() {
        this.showPop = false;
      },
    },
  }
</script>

<style scoped lang="scss">
  .popup-matter-container {
    width: 100%;
    background-color: #fff;
    color: #333;
    box-sizing: border-box;
    .vux-1px-t:before {
      border-color: #e8e8e8;
    }

    .popup-top {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 0 .15rem;
      height: .4rem;
      .icon-close {
        display: inline-block;
        width: .14rem;
        height: .14rem;
      }
    }

    .popup-header {
      margin-top: .05rem;
      padding: 0 .15rem;
      line-height: .17rem;
      font-size: .16rem;
      font-weight: 600;
    }

    .scroll-container {
      height: calc(100% - .62rem);
    }

    .matter-main {
      display: flex;
      margin-top: .24rem;
      padding: 0 .15rem;
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
    }

    /* 其他数据 */
    .matter-other {
      margin-bottom: .24rem;
      padding: 0 .15rem;
      .matter_other_item {
        display: flex;
        justify-content: space-between;
        margin-top: .12rem;
        line-height: .14rem;
        font-size: .14rem;
      }
      .matter_other_title {
        color: #999;
      }
    }

    /* 时间部分 */
    .matter-date {
      padding: .24rem .15rem .08rem;
      .matter_date_item {
        display: flex;
        line-height: .12rem;
        color: #696969;
        font-size: .12rem;
        & + .matter_date_item {
          margin-top: .12rem;
        }
      }
    }

    /* 说明 */
    .matter-comment {
      padding: .24rem .15rem .19rem;
      .matter_comment_title {
        line-height: .17rem;
        font-size: .16rem;
        font-weight: 600;
      }
      .matter_comment_value {
        margin-top: .16rem;
        line-height: .2rem;
        font-size: .14rem;
      }
    }

  }
</style>
