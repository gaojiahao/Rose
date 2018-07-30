<template>
    <div class="pages">
        <div class="basicPart" v-if='orderInfo && orderInfo.order'>
            <!-- 工作流 -->
            <div class="work_flow mg_auto box_sd" @click="workFlowPop = true" :class="{hidden : simpleWL.length<=0}">
              <!-- 右箭头 -->
              <x-icon class="r_arrow" type="ios-arrow-down" size="30"></x-icon>
              <!-- 表单状态 及 编码 -->
              <div class="work_info">
                <!-- 状态 -->
                <span class="work_status" 
                      :class="orderInfo.dyClass">
                  {{orderInfo.biStatus}}
                </span>
                <!-- 编码 -->
                <span class="work_code"
                      :class="orderInfo.coClass">
                  {{orderInfo.transCode.replace(/_/g,'')}}
                </span>
              </div>
              <!-- 简化版工作流 -->
              <div class="flow_list">
                <div class="each_msg vux-1px-b"
                    v-for="(item, index) in simpleWL" 
                    :key=index>
                    <!-- 头像 -->
                  <div class="user_avatar">
                    <img :src='index % 2 ? defaulImg2: defaulImg' alt="avatar">
                  </div>
                  <!-- 操作信息 -->
                  <div class="handle_info">
                    <div class="handle_name">
                      <!-- 操作动作 -->
                      <span>{{item.nodeName}}</span>
                      <!-- 操作状态 A(没有返回状态) -->
                      <span class="status" 
                            v-if="!item.status && index % 2">
                        {{orderInfo.biStatus}}
                      </span>
                      <!-- 操作状态 B(有返回状态) -->
                      <span class="status"
                            :class=item.dyClass
                            v-else-if="item.status && index % 2">
                        {{item.status}}
                      </span>
                    </div>
                    <!-- 流程节点 用户名 -->
                    <div class="user_name">
                      {{item.userName}}
                    </div>
                    <!-- 备注 -->
                    <div class="remark">备注: {{item.message || '无'}}</div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 用户地址和基本信息-->
            <!-- <div class="or_ads mg_auto box_sd">
              <div class="user_info">
                <span class="user_name">{{orderInfo.dealerDebitContactPersonName}}</span>
                <span class="user_tel">{{orderInfo.dealerDebitContactInformation}}</span>
              </div>
              <div class="cp_info">
                <p class="cp_name">{{orderInfo.order.dealerName_dealerDebit}}</p>
                <p class="cp_ads">{{orderInfo.order.province_dealerDebit}}{{orderInfo.order.city_dealerDebit}}{{orderInfo.order.county_dealerDebit}}{{orderInfo.order.address_dealerDebit}}</p>
              </div>
            </div> -->
            <!-- 结算方式 -->
            <!-- <div class="trade_mode mg_auto box_sd">
              <p class="title">结算方式</p>
              <p class="mode">{{orderInfo.drDealerPaymentTerm || '无'}}</p>
            </div> -->
            <!-- 物料列表 -->
            <div class="materiel_list mg_auto box_sd">
              <div class="title">物料列表</div>
                <div class="mater_list">
                  <div class="each_mater vux-1px-b" v-for="(item, index) in orderInfo.order.dataSet" :key='index'>             
                    <div class="each_mater_wrapper">
                      <div class="mater_img">
                        <img :src="item.inventoryPic_transObjCode" alt="mater_img" @error="getDefaultImg(item)">
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
                                <span class="num">{{item.specification_transObjCode || '无'}}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- 物料数量和价格 -->
                        <div class='mater_other'>
                          <div class='mater_num'>
                            <span class="num">单价: ￥{{item.price | numberComma(3)}}</span>
                            <span class='num'>数量: {{item.tdQty}}</span>
                            <!-- <span>税率: {{item.taxRate}}</span> -->
                          </div>      
                          <div class='mater_price'>
                            ￥{{item.price*item.tdQty | numberComma(3)}} 
                            <!-- <span class="num" 
                                  :style="{display:(item.tdAmount && item.tdAmount.toString().length >= 7 ? 'block' : '')}">
                              [金额: ￥{{item.noTaxAmount | numberComma(3)}} + 税金: ￥{{item.taxAmount | numberComma(3)}}]
                            </span> -->
                          </div>        
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 金额合计栏 -->
                  <div class="price_list">
                    <div class='title' >合计<span style="fontSize:.12rem;"></span></div>
                    <div class="num"><span style="fontSize:.12rem;">￥</span>{{count | numberComma(3)}}</div>
                  </div>
                </div>
            </div>
            <!-- 审批操作 -->
            <div class="handle_btn" v-if="isMyTask || (cancelStatus && cancelStatus1)">
              <span class='reject' @click="cancel()" v-if='cancelStatus && cancelStatus1'>撤回</span>
              <span class="reject" v-if='nodeName.indexOf("disagree")>=0 && (!cancelStatus ||!cancelStatus1)' @click="reject">拒绝</span>
              <span class="agree" v-if='nodeName.indexOf("agree")>=0' @click="agree">同意</span>
            </div>
            <!-- <div class="handle_btn" v-if="cancelStatus && cancelStatus1">
              <span class='reject' @click="cancel()">撤回</span>
            </div> -->
            <!-- 完整工作流 -->
            <work-flow  
              :popupShow="workFlowPop" 
              v-model="workFlowPop"
              :crtTime="orderInfo.crtTime"
              :noStatus="orderInfo.biStatus"></work-flow>
        </div>
    </div>
</template>

<script>
import { numberComma } from 'vux'
import { isMyflow, getSOList, getWorkFlow,getListId } from 'service/detailService.js'
import {saveAndCommitTask,commitTask} from 'service/commonService.js'
import common from 'components/mixins/detailCommon.js'
import workFlow from 'components/workFlow.vue'
export default {
  data(){
    return{
      count : 0,          // 金额合计  
      fullWL: [],         // 完整版工作流
      simpleWL: [],       // 简化版工作流(只包含最后两个)
      orderInfo: {},      // 表单内容
      nodeName:'',        // 操作名称
      isMyTask:'',        // 是否与我有关
      formViewUniqueId : '',
      defaulImg: require('assets/avatar.png'),   // 默认图片1
      defaulImg2: require('assets/io.jpg'),       // 默认图片2
      workFlowPop : false,
      submitInfo : {},
      transCode :'',
    }
  },
  components:{
    workFlow
  },
  filters:{
    numberComma
  },
  mixins: [common],
  methods:{
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    reject(){
      this.taskReject();
    
    },
    agree(){
      this.taskAgree();
    },
    cancel(){
      this.taskCancel();
    },
    //随机ID
    randomID() {
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return ( S4() + S4() + S4() );
    },
    // 获取详情
    async getOrderList(transCode = ''){
        await getListId(transCode).then( data=>{
          this.formViewUniqueId = data[0].uniqueId;
        })
        // 流程节点是否与<我>有关
        await isMyflow({
            _dc: this.randomID(),
            transCode
          }).then(({ tableContent }) => {
            if(tableContent.length>0){
              this.taskId = tableContent[0].taskId;
              if(tableContent[0].isMyTask === 1){
                let { isMyTask = 0, actions,viewId} = tableContent[0];
                this.isMyTask = isMyTask;
                this.nodeName = actions;
                this.formViewUniqueId = viewId;
              }
            }
          })
        await this.getWorkFlow(transCode);
        await getSOList({
          formViewUniqueId : this.formViewUniqueId,
          transCode
        }).then(data => {
          this.submitInfo  = JSON.parse(JSON.stringify(data));
          // http200时提示报错信息
          if(data.success === false){
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            })
            return;
          }
          // 获取合计
          let { dataSet } = data.formData.order;
          for(let val of dataSet){
            this.count += val.tdQty*val.price*100;
            val.inventoryPic_transObjCode = val.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}` : this.getDefaultImg();
          }
          this.count = this.count/100;
          // 动态添加class
          for(let key in data.formData){
            switch (data.formData[key]){
              case '进行中':
                let newkey = 'dyClass',
                    cokey = 'coClass';
                data.formData[newkey] = 'doing_work';
                data.formData[cokey] = 'doing_code';
                break;
              case '已失效':
                newkey = 'dyClass';
                data.formData[newkey] = 'invalid_work';
                break;
            }
          }
          this.orderInfo = data.formData;
        })

    },   
  },
  created(){
  }
}
</script>

<style lang='scss' scoped>
.vux-1px-t:before, 
.vux-1px-b:after {
  border-bottom: 1px solid #e8e8e8;
}

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
  height: 100%;
}
// 工作流
.work_flow {
  position: relative;
  padding: .06rem .08rem .2rem;
  // 右箭头
  .r_arrow {
    bottom: 0;
    left: 50%;
    position: absolute;
    transform: translate(-50%, 0);
  }
  .hidden{
    display: none;
  }
  // 提示文字
  .tip_tx {
    width: 100%;
    font-size: .1rem;
    color: #757575;
    padding: .04rem 0;
  }
  // 表单基本信息
  .work_info {
    display: flex;
    .work_status,
    .work_code {
      font-weight: bold;
      font-size: .14rem;
      padding: 0 .06rem;
      display: inline-block;    
    }
    // 表单状态
    .work_status {
      color: #fff;
      background: #53d397;
      border-top-left-radius: .12rem;
    }
    // 进行中
    .doing_work {
      background: #5077aa;
    }
    // 已失效
    .invalid_work {
      background: #c93d1b;
    }
    // 表单编码
    .work_code {
      display: inline-block;
      background: #455d7a;
      color: #fff;
    }
    // 进行中 编码 {
    .doing_code {
      color: #111;
      background: #dbe2ef;
    }  
  
  }
  // 工作流信息
  .flow_list {
    margin-top: .1rem;
    position: relative;
    // 每一个明细
    .each_msg {
      display: flex;
      padding-bottom: .1rem;
      margin-bottom: .1rem;
      // 用户头像
      .user_avatar {
        width: .55rem;
        height: .55rem;
        img {
          width: 100%;
        }
      }
      // 操作信息
      .handle_info {
        color: #111;
        display: flex;
        font-size: .12rem;
        margin-left: .1rem;
        flex-direction: column;
        justify-content: center;
        // 用户名称
        .user_name {
          font-size: .12rem;
        }
        // 操作名称
        .handle_name {
          font-size: .14rem;
          font-weight: bold;
          span{
            display: inline-block;
          }
          // 默认样式
          .status {
            color: #fff;            
            font-size: .1rem;
            padding: 0 .04rem;
            margin-top: -.02rem;
            background: #5077aa;
            vertical-align: middle;
          }
          // 同意样式
          .agree_c {
            background: #53d397;
          }
          // 拒绝样式
          .reject_c {
            background: #c93d1b;
          }          
        }
        // 备注
        .remark {
          font-size: .1rem;
          color: #757575;
        }
      }
    }
  }
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
      font-size: .2rem;
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
// 审批操作
.handle_btn {
  width: 100%;
  height: .4rem;
  margin: .2rem 0;  
  line-height: .4rem;
  text-align: center;
  span {
    width: 1.4rem;
    color: #fff;
    text-align: center;
    display: inline-block;
    border-radius: .24rem;
  }
  // 拒绝
  .reject {
    margin-right: .2rem;
    background: #ea5455;
    box-shadow: 0 2px 5px #ea5455;
  }
  // 同意
  .agree {
    background: #5077aa;
    box-shadow: 0 2px 5px #5077aa;
  }

}

</style>
