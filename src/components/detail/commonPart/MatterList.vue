<template>
  <div class="materiel_ct_list">
    <div class="title">
      <span class="iconfont icon-Shape"></span>物料列表
    </div>
    <div class="mater_list" v-if="$scopedSlots.matterOther">
      <matter-item :item="item" v-for="(item, index) in matterList" :key='index'>
        <!-- 物料详情 -->
        <template slot="other" slot-scope="{item}">
          <slot name="matterOther" :item="item"></slot>
        </template>
      </matter-item>
    </div>
    <div class="mater_list" v-else>
      <matter-item :item="item" :class="{'vux-1px-b' : index !== matterList.length - 1}"
                   v-for="(item, index) in matterList" :key='index'></matter-item>
    </div>
    <div class="comment-part">
      <form-cell cellTitle='备注' :cellContent="orderRemarks || '无'"></form-cell>
    </div>
  </div>
</template>

<script>
import {numberComma} from 'vux'
import {toFixed} from '@/plugins/calc'
import FormCell from 'components/detail/commonPart/FormCell'
import MatterItem from 'components/detail/commonPart/MatterItem'
export default {
  name: 'MatterList',
  props: {
    matterList: {
      type: Array,
      default: []
    },
    orderRemarks: {
      type: String,
      default: '无'
    }
  },
  components: {
    FormCell, MatterItem
  },
  filters: {
    numberComma,
    toFixed,
  },
}
</script>

<style scoped lang="scss">
.vux-1px-t:before {
  border-color: #e8e8e8;
}
// 物料列表
.materiel_ct_list {
  position: relative;
  background: #FFF;
  padding: .06rem .08rem;
  // .comment-part {
  //   width: 100%;
  //   background: #fff;
  //   margin-bottom: .1rem;
  //   padding: .06rem .08rem;
  // }
  .title {
    color: #111;
    font-weight: bold;
    font-size: .16rem;
    .icon-Shape {
      font-size: .14rem;
      font-weight: normal;
    }
  }
  .price_cell {
    padding: .08rem 0;
    .title {
      color: #757575;
      font-size: .14rem;
      font-weight: normal;
    }
    .each_mater_wrapper {
      display: flex;
      position: relative;
      margin-bottom: .04rem;
      // 订单底下的物料
      .order_matter {
        // margin-top: .04rem;
      }
      // 物料图片
      .mater_img {
        width: .75rem;
        height: .75rem;
        margin-top: .04rem;
        display: inline-block;
        img {
          width: 100%;
          max-height: 100%;
        }
      }
      // 物料主体
      .mater_main {
        max-width: 2.6rem;
        margin-left: .1rem;
        display: inline-block;
        box-sizing: border-box;
        // 物料名称
        .mater_name {
          color: #111;
          overflow: hidden;
          font-size: .14rem;
          font-weight: bold;
          max-height: .46rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          text-overflow: ellipsis;
          -webkit-box-orient: vertical;
          // 每个物料的索引
          .whiNum {
            color: #fff;

            padding: 0 .02rem;
            font-size: .1rem;
            display: inline-block;
            background: #ea5455;
            vertical-align: middle;
            margin: -.02rem .04rem 0 0;
          }
        }
        // 物料信息
        .mater_info {
          color: #757575;
          font-size: .12rem;
          margin-top: .02rem;
          // display: inline-block;
          // 有颜色包裹的
          .withColor {
            font-size: 0;
            // 物料编码
            .mater_code {
              // display: flex;

              margin-right: .06rem;
              .title,
              .num {
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
            }
            // 规格
            .mater_spec {
              @extend .mater_code;
              .title {
                background: #537791;
              }
              .num {
                color: #fff;
                max-width: .6rem;
                background: #ff7f50;
              }
            }
            // 科目
            .mater_sub {
              @extend .mater_code;
              .title {
                background: #0881a3;
              }
              .num {
                background: #ffd6a4;
              }
            }
          }
          // 没颜色包裹的
          .withoutColor {
            // 物料分类
            .mater_classify {
              font-size: .14rem;
              margin-top: .04rem;
              .father {
                margin-right: .1rem;
              }
            }
            // 物料颜色 材质
            .mater_material {
              font-size: .12rem;
              margin-top: .1rem;
              .unit,
              .color {
                margin-right: .06rem;
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

            .num {
              font-size: .1rem;
              color: #757575;
              .symbol {
                font-size: .08rem;
              }
            }
          }
          // 单价 数量 税率 等
          .mater_num {
            color: #757575;
            font-size: 0.1rem;
            span {
              display: inline-block;
            }
            .num {
              margin-right: 0.04rem;
            }

          }
          // 费用报销
          .mater_reimb {
            // 金额
            .price {
              .title {
                font-size: .14rem;
              }
              .content {
                font-size: .18rem;
                color: #5077aa;
              }
            }
            // 报销事由
            .reason {
              @extend .price;
              .content {
                color: #111;
                font-size: .14rem;
              }
            }
          }
        }
      }
      // 下划线
      .vux-1px-b:after {
        border-bottom: 1px solid #e8e8e8;
      }
      .symbol {
        font-size: .14rem;
      }
      .num {
        color: #c93d1b;
        font-size: .2rem;
        font-weight: bold;
      }
    }
    .icon-Shape {
      font-size: .14rem;

      margin-right: .02rem;
    }
    // 物料列表
    .mater_list {
      width: 100%;
      box-sizing: border-box;
    }
    .vux-1px-b:after {
      border-color: #e8e8e8;
    }
  }
}

</style>
