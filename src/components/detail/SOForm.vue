<template>
    <div class="pages">
<<<<<<< HEAD
        <div class="basicPart" v-if='orderInfo && orderInfo.order'>
=======
        <div class="basicPart" v-if='orderInfo.order'>
>>>>>>> 1707867dc3fdb171c74888b3bab6b422f1971622
            <!-- 用户地址和基本信息-->
            <div class="or_ads mg_auto box_sd">
              <div class="user_info">
                <span class="user_name">{{orderInfo.dealerDebitContactPersonName}}</span>
                <span class="user_tel">{{orderInfo.dealerDebitContactInformation}}</span>
              </div>
              <div class="cp_info">
                <p class="cp_name">{{orderInfo.order.dealerName_dealerDebit}}</p>
                <p class="cp_ads">{{orderInfo.order.province_dealerDebit}}{{orderInfo.order.city_dealerDebit}}{{orderInfo.order.county_dealerDebit}}{{orderInfo.order.address_dealerDebit}}</p>
              </div>
            </div>
            <!-- 结算方式 -->
            <div class="trade_mode mg_auto box_sd">
              <p class="title">结算方式</p>
              <p class="mode">{{orderInfo.drDealerPaymentTerm}}</p>
            </div>
            <!-- 物流条款 -->
            <div class="trade_mode mg_auto box_sd" @click="showLogPop = !showLogPop">
              <p class="title">物流条款</p>
              <p class="mode">{{orderInfo.drDealerLogisticsTerms}}</p>
            </div>
            <!-- 物料列表 -->
            <div class="materiel_list mg_auto box_sd">
              <div class="title">物料列表</div>
                <div class="mater_list">
                  <div class="each_mater vux-1px-b" v-for="(item, index) in orderInfo.order.dataSet" :key='index'>             
                    <div class="each_mater_wrapper">
                      <div class="mater_img">
                        <img :src="getDefaultImg()" alt="mater_img" @error="getDefaultImg(item)">
                      </div>
                      <div class="mater_main">
                        <!-- 物料名称 -->
                        <div class="mater_name">
                          {{item.inventoryName_transObjCode}}
                        </div>
                        <!-- 物料基本信息 -->
                        <div class="mater_info">
                            <!-- 物料编码、规格 -->
                          <div class="withColor">
                            <!-- 物料编码 -->
                            <div class="ForInline" style="display:inline-block">
                              <div class="mater_code">
                                <span class="title">编码</span>
                                <span class="num">{{item.transObjCode}}</span>
                              </div>
                            </div>
                            <!-- 物料规格 -->
                            <div class="ForInline" style="display:inline-block">
                              <div class="mater_spec">
                                <span class="title">规格</span>
                                <span class="num">{{item.specification_transObjCode}}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- 物料数量和价格 -->
                        <div class='mater_other'>
                          <div class='mater_num'>
                            <span class="num">单价: ￥{{item.price}}</span>
                            <span class='num'>数量: {{item.tdQty}}</span>
                            <span>税率: {{item.taxRate}}</span>
                          </div>      
                          <div class='mater_price'>
                            ￥{{item.tdAmount}} 
                            <span class="num" 
                                  :style="{display:(item.tdAmount && item.tdAmount.toString().length >= 7 ? 'block' : '')}">
                              [金额: ￥{{item.noTaxAmount}} + 税金: ￥{{item.taxAmount}}]
                            </span>
                          </div>        
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="price_list">
                    <div class='title' >合计<span style="fontSize:.12rem;">(含税)</span></div>
                    <div class="num"><span style="fontSize:.16rem;">￥</span>{{count}}</div>
                  </div>
                </div>
            </div>
          </div>
        </div>
    </div>
</template>

<script>
import { getSOList } from 'service/detailService.js'
export default {
  data(){
    return{
      count : 0,
      orderInfo:{},
      formViewUniqueId : 'f1902d94-5368-4abb-9ebb-67613f550e79'
    }
  },
  methods:{
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    //获取详情
    getOrderList(transCode = ''){
        getSOList({
          formViewUniqueId : this.formViewUniqueId,
          transCode : transCode
        }).then( data => {
          // http200时提示报错信息
          if(data.success === false){
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            })
            return;
          }
          let { formData : detalInfo } = data,
              { dataSet } = detalInfo.order;
          // 获取合计
          for(let val of dataSet){
            this.count += val.tdAmount;
          }
          // 赋值表单内容
          this.orderInfo = detalInfo;
        }).catch( err => {
          this.$vux.alert.show({
            content: err.message
          })
        })

    }
  },
  created(){
    let { transCode } = this.$route.query;
    if(!transCode){
      this.$vux.alert.show({
        content: '抱歉，交易号有误，请尝试刷新之后再次进入'
      })
      return;
    }
    this.getOrderList(transCode);
  }
}
</script>

<style lang='scss'>
// 居中
.mg_auto {
  width: 95%;
  margin: 10px auto;
}
// 阴影
.box_sd {
  box-sizing: border-box;
  box-shadow: 0 0 8px #e8e8e8;
}
.basicPart {
  overflow: auto;
  height: 93%;
}
// 地址栏
.or_ads {
  position: relative;
  padding: .06rem .4rem .06rem .08rem;
  // 用户信息
  .user_info {
    color: #111;
    font-size: .2rem;
    font-weight: 500;
    // 用户姓名
    .user_name {
      color: #5077aa;
    }
    // 用户电话
    .user_tel {
      font-size: .14rem;
      font-weight: bold;
      font-family: sans-serif, -apple-system-font;
    }
  }
  // 公司信息
  .cp_info {
    .cp_name {
      color: #111;
      font-weight: 500;
    }
    .cp_ads {
      font-weight: 200;
      color: #757575;
    }
  }
}
// 结算方式
.trade_mode {
  position: relative;
  padding: .06rem .08rem;
  .title {
    color: #757575;
    font-weight: 200;
    font-size: .12rem;
  }
  .mode {
    color: #111;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
  }
}
// 物料列表
.materiel_list {
  position: relative;
  padding: .06rem .08rem;
  .title {
    color: #757575;
    font-weight: 200;
    font-size: .12rem;
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
    .vux-1px-b:after {
      border-bottom: 1px solid #e8e8e8;
    }
    // 每个物料
    .each_mater {
      padding: 0.08rem;
      position: relative;
      box-sizing: border-box;
      .each_mater_wrapper {
        position: relative;
        display: flex;
        // 物料图片
        .mater_img {
          display: inline-block;
          width: .75rem;
          height: .75rem;
          img {
            width: 100%;
            max-height: 100%;
          }
        }
        // 物料主体
        .mater_main {
          flex: 1;
          padding-left: .1rem;
          box-sizing: border-box;
          display: inline-block;
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
              padding: 0 .1rem;
              font-size: .1rem;
              display: inline-block;
              background: #ea5455;
              vertical-align: middle;
              margin: -.01rem .04rem 0 0;
            }
          }
          // 物料信息
          .mater_info {
            color: #757575;
            font-size: .12rem;
            // 有颜色包裹的
            .withColor {
              // 物料编码
              .mater_code {
                display: flex;
                .title,
                .num {
                  font-size: .1rem;
                  display: inline-block;
                  padding: .01rem .04rem;
                }
                .title {
                  color: #fff;
                  background: #3f72af;
                }
                .num {
                  color: #111;
                  max-width: .9rem;
                  overflow: hidden;
                  white-space: nowrap;
                  background: #dbe2ef;
                  text-overflow: ellipsis;
                }
              }
              // 规格
              .mater_spec {
                @extend .mater_code;
                margin-left: .1rem;
                .title {
                  color: #fff;
                  background: #537791;
                }
                .num {
                  color: #fff;
                  max-width: .6rem;
                  overflow: hidden;
                  white-space: nowrap;
                  background: #ff7f50;
                  text-overflow: ellipsis;
                }
              }
            }
            // 没颜色包裹的
            .withoutColor {
              // 物料分类
              .mater_classify {
                // color: #111;
                // font-weight: bold;
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
          .mater_other{
            margin-top: .02rem;
            align-items: center;
            .mater_price{
              color:#ea5455;
              font-weight: bold;
              font-size:0.16rem;
              line-height: 0.2rem;
              margin-top: .04rem;
              display: inline-block;
              
              .num {
                font-size: .1rem;
                color: #757575;
              }
            }
            .mater_num{
              color:#757575;
              font-size:0.1rem;
              span{
                display: inline-block;
              }
              .num{
                margin-right:0.04rem;                  
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
    // 合计
    .price_list {
      width: 100%;
      display: flex;
      margin-top: .1rem;
      color: #5077aa;
      font-size: .24rem;
      text-align: center;
      justify-content: space-between;
      .title {
        font-size: .2rem;
        font-weight: 200;
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
}
.vux-1px-t:before {
  border-top: 1px solid #e8e8e8;
}

</style>
