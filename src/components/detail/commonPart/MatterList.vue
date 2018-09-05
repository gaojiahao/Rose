<template>
  <div>
    <div class="materiel_list">
      <div class="title">
        <span class="iconfont icon-Shape"></span>物料列表
      </div>
      <div class="mater_list">
        <div class="each_mater"
        :class="{'vux-1px-b' : index !== matterList.length - 1}"
        v-for="(item, index) in matterList"
        :key='index'>
          <div class="each_mater_wrapper">
            <div class="mater_img">
              <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
            </div>
            <div class="mater_main">
              <!-- 物料名称 -->
              <div class="mater_name">
                {{item.inventoryName_transObjCode || '该物料未获取到名称，请检查物料信息。'}}
              </div>
              <!-- 物料基本信息 -->
              <div class="mater_info">
                  <!-- 物料编码、规格 -->
                <div class="withColor">
                  <!-- 物料编码 -->
                  <div class="ForInline" style="display:inline-block">
                    <div class="mater_code">
                      <span class="title">编码</span>
                      <span class="num">{{item.transObjCode || '无'}}</span>
                    </div>
                  </div>
                  <!-- 物料规格 -->
                  <div class="ForInline" style="display:inline-block">
                    <div class="mater_spec">
                      <span class="title">规格</span>
                      <span class="num">{{item.specification_transObjCode || '无'}}</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 物料数量和价格 -->
              <div class='mater_other'>
                <div class='mater_num' v-if='item.tdQty'>
                  <span class="num">单价: ￥{{item.price | toFixed | numberComma(3)}}</span>
                  <span class='num'>数量: {{item.tdQty}}</span>
                  <span v-show='item.taxRate'>税率: {{item.taxRate}}</span>
                </div>
                <div class='mater_other' v-if="item.priceType || item.priceType === ''">
                  <div class='mater_price'>
                    <span class="symbol">￥</span>{{item.price | toFixed |numberComma(3)}}
                    <span class="num">[类型: {{item.priceType || '无'}}]</span>
                  </div>
                </div>
                <div class='mater_price' v-else>
                  <span>￥{{item.tdAmount | toFixed | numberComma(3)}}</span>
                  <span class="num"
                        :style="{display:(item.tdAmount && item.tdAmount.toString().length >= 4 ? 'block' : '')}"
                        v-show="item.taxRate">
                    [金额: ￥{{item.noTaxAmount | toFixed | numberComma(3)}} + 税金: ￥{{item.taxAmount | toFixed | numberComma(3)}}]
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {numberComma} from 'vux'
  import {toFixed} from '@/plugins/calc'
  export default {
    props:{
      matterList : {
        type : Array,
        default : []
      }
    },
     filters: {
      numberComma,
      toFixed,
    },
    created(){
      console.log(this.matterList)
    }

  }
</script>

<style scoped lang="scss">
// 物料列表
.materiel_list {
  position: relative;
  background: #FFF;
  padding: .06rem .08rem;
  .title {
    color: #111;
    font-weight: bold;
    font-size: .18rem;
  }
  .price_cell {
    padding: .08rem 0;
    .title {
      color: #757575;
      font-size: .14rem;
      font-weight: normal;
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
    font-size: .12rem;
    font-weight: 200;
    margin-right: .04rem;
  }
  .tips {
    color: #111;
    font-weight: 500;
  }
  // 右箭头
  .r_arrow {
    top: 50%;
    right: .04rem;
    position: absolute;
    transform: translate(0, -50%);
  }
  // 物料列表
  .mater_list {
    width: 100%;
    box-sizing: border-box;
    // 每个物料
    .each_mater {
      padding: .04rem 0 .08rem;
      position: relative;
      box-sizing: border-box;
      // 所属订单
      .order_code {
        display: flex;
        color: #fff;
        font-size: .12rem;
        font-weight: bold;
        span {
          display: inline-block;
          padding: 0 .04rem;
        }
        .order_title {
          background: #1160aa;
        }
        // 订单号
        .order_num {
          background: #9bb4da;
          border-top-right-radius: .08rem;
        }
      }
      .each_mater_wrapper {
        display: flex;
        position: relative;
        // 订单底下的物料
        .order_matter {
          margin-top: .04rem;
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
              font-weight: 200;
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
            margin-top: .04rem;
            display: inline-block;
            // 有颜色包裹的
            .withColor {
              // 物料编码
              .mater_code {
                // display: flex;
                font-weight: 200;
                margin-right: .02rem;
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
                  margin-left: -.04rem;
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
                  margin-left: -.04rem;
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
      }
    }
  }
  // 新增更多
  .add_more {
    width: 1rem;
    color: #fff;
    height: .24rem;
    font-size: .12rem;
    text-align: center;
    line-height: .24rem;
    margin: 0 auto .1rem;
    border-radius: .4rem;
    background: #5077aa;
    box-shadow: 0 2px 5px #5077aa;
  }
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }
}


</style>
