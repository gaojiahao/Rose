<template>
  <div class="pages">
    <div class="basicPart">
      <!-- 用户地址和基本信息-->
      <div class="or_ads mg_auto box_sd" @click="goSetAds">
        <div class="user_info">
          <span class="user_name">刘治增</span>
          <span class="user_tel">153****9500</span>
        </div>
        <div class="cp_info">
          <p class="cp_name">深圳市瑞福登信息技术服务有限公司</p>
          <p class="cp_ads">广东省 深圳市 福田区 中康路120附近 卓越城2期 TOWERB 1706</p>
        </div>
        <x-icon class="r_arrow" type="ios-arrow-right" size="30"></x-icon>
      </div>
      <!-- 结算方式 -->
      <div class="trade_mode mg_auto box_sd" @click="showTransPop = !showTransPop">
        <p class="title">结算方式</p>
        <p class="mode">{{isThisTrans}}</p>
        <span class="iconfont icon-gengduo"></span>
        <!-- 结算popup -->
        <div v-transfer-dom >
          <popup v-model="showTransPop" height="70%" id="trade_pop_part">
            <div class="trade_pop">
              <div class="title">结算方式<x-icon class="close_icon" type="ios-close-empty" size="30" @click="showTransPop = !showTransPop"></x-icon></div>
              <span class="each_mode vux-1px" v-for="(item, index) in transMode" :key="index">{{item}}</span>
            </div>
            <div class="cfm_btn">确定</div>
          </popup>
        </div>
      </div>
      <!-- 物流条款 -->
      <div class="trade_mode mg_auto box_sd" @click="showLogPop = !showLogPop">
        <p class="title">物流条款</p>
        <p class="mode">{{isThisLog}}</p>
        <span class="iconfont icon-gengduo"></span>
        <!-- 结算popup -->
        <div v-transfer-dom >
          <popup v-model="showLogPop" height="60%" id="trade_pop_part">
            <div class="trade_pop">
              <div class="title">物流条款<x-icon class="close_icon" type="ios-close-empty" size="30" @click="showLogPop = !showLogPop"></x-icon></div>
              <span class="each_mode vux-1px" v-for="(item, index) in logisticsTerm" :key="index">{{item}}</span>
            </div>
            <div class="cfm_btn">确定</div>
          </popup>
        </div>
      </div>
      <!-- 物料列表 -->
      <div class="materiel_list mg_auto box_sd" >
        <!-- 没有选择物料 -->
        <template v-if="!materList.length">
          <div @click="showMaterielPop = !showMaterielPop">
            <div class="title">物料列表</div>
            <div class="tips">请选择物料</div>
            <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
          </div>
        </template>
        <!-- 已经选择了物料 -->
        <template v-else>
          <div class="title">物料列表</div>
          <div class="mater_list">
            <div class="each_mater vux-1px-b" v-for="(item, index) in materList" :key='index'>
              <swipeout>
                <swipeout-item>
                  <div slot="right-menu">
                    <swipeout-button @click.native="delClick(index)" type="warn">删除</swipeout-button>
                  </div>
                  <div slot="content">
                    <div class="mater_img">
                      
                    </div>
                    <!-- 物料名称 -->
                    <div class="mater_name">
                      <!-- <span class="whiNum">No.{{index + 1}}</span> -->
                      2017加拿大纪念银币（鸡）五百枚特别至尊版封装评级证书
                    </div>
                    <!-- 物料基本信息 -->
                    <div class="mater_info">
                      <!-- 物料编码 -->
                      <div class="ForInline" style="display:inline-block">
                        <div class="mater_code">
                          <span class="title">物料编码</span>
                          <span class="num">CMGI1H1602100</span>
                        </div>
                      </div>
                      <!-- 物料规格 -->
                      <div class="ForInline" style="display:inline-block">
                        <div class="mater_spec">
                          <span class="title">规格</span>
                          <span class="num">80*110</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </swipeout-item>
              </swipeout>
              <!-- 物料输入内容 -->
              <!-- <div class="userInp_mode">
                <group>
                  <cell title="计量单位" value='箱'></cell>
                  <popup-radio title="辅助计量" :options="assistUnitList" v-model="assistUnit"></popup-radio>
                  <x-input title="数量" text-align='right' placeholder='请填写'></x-input>
                  <x-input title="辅计数量" text-align='right' placeholder='请填写'></x-input>
                  <x-input title="单价" text-align='right' placeholder='请填写'></x-input>
                  <x-input title="金额" text-align='right' placeholder='请填写'></x-input>
                  <x-input title="税率" text-align='right' placeholder='请填写'></x-input>
                  <x-input title="税金" text-align='right' placeholder='请填写'></x-input>
                  <x-input title="价税小计" text-align='right' placeholder='请填写'></x-input>
                  <datetime v-model="deliveryDate" title="预计交付日"></datetime>                  
                  <x-input title="说明" text-align='right' placeholder='请填写'></x-input>
                </group>
              </div> -->
            </div>
          </div>
        </template>
        <!-- 新增更多 按钮 -->
        <div class="add_more" v-if="materList.length" @click="showMaterielPop = !showMaterielPop">新增更多物料</div>
        <!-- 物料popup -->
        <div v-transfer-dom >
          <popup v-model="showMaterielPop" height="80%" id="trade_pop_part">
            <div class="trade_pop" style="height:95%; overflow:auto">
              <div class="title">
                <!-- 搜索栏 -->
                <div class="search_part">
                  <input class="srh_inp" type="text" v-model="srhInpTx">
                  <div class="pop_cancel" @click="showMaterielPop = !showMaterielPop">返回</div>
                  <x-icon class="serach_icon" type="ios-search" size="20"></x-icon>
                  <icon class="clear_icon" type="clear" v-if="srhInpTx" @click.native="srhInpTx = ''"></icon>
                </div>
              </div>
              <!-- 物料列表 -->
              <div class="mater_list">
                <div class="each_mater box_sd" v-for="(item, index) in 10" :key='index' @click.stop="selThis(index)">
                  <!-- 物料名称 -->
                  <div class="mater_name">2017加拿大纪念银币（鸡）五百枚特别至尊版封装评级证书</div>
                  <!-- 物料基本信息 -->
                  <div class="mater_info">
                    <div>
                      <span class="speci">规格: 80*110</span>
                      <span class="code">物料编码: CMGI1H1602100</span>
                    </div>
                    <div>
                      <span class="Unit">计量单位: 箱</span>
                      <span class="assistUnit">辅助计量: 请选择</span>
                    </div>
                  </div>
                  <!-- icon -->
                  <x-icon class="selIcon" type="ios-circle-outline" size="20"></x-icon>
                  <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-if="whichIndex.includes(index)"></x-icon>
                </div>
              </div>
            </div>
            <!-- 底部栏 -->
            <div class="count_mode vux-1px-t">
              <span class="count_num"> {{whichIndex.length ? `已选 ${whichIndex.length} 个` : '请选择'}} </span>
              <span class="count_btn" @click="cfmMater">确定</span>
            </div>
          </popup>
        </div>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t">
      <span class="count_num">￥0</span>
      <span class="count_btn">提交订单</span>
    </div>
  </div>
</template>

<script>
import { Icon, Cell, Popup, Group, XInput, Datetime, PopupRadio, Swipeout, SwipeoutItem, SwipeoutButton } from 'vux'
export default {
  components:{
    Icon, Cell, Popup, Group, XInput, Datetime, PopupRadio, Swipeout, SwipeoutItem, SwipeoutButton
  },
  data(){
    return{
      srhInpTx:'',                                   // 搜索框内容
      materList:[],                                  // 物料列表
      whichIndex:[],                                 // 哪些被选中了
      deliveryDate:'',                               // 预计交付日       
      isThisLog:'上门',                               // 默认物流条款
      isThisTrans:'现付',                             // 默认支付方式
      assistUnit: '请选择',                           // 辅助计量显示值
      assistUnitList: ['A', 'B', 'C'],               // 辅助计量列表
      transMode:['现付','预付','账期','票据'],          // 结算方式
      logisticsTerm:['上门','自提','离岸','到港'],      // 物流条款
      showLogPop:false,                              // 是否显示物流条款的popup
      showTransPop:false,                            // 是否显示结算方式的popup
      showMaterielPop:false,                         // 是否显示物料的popup
    }
  },
  methods:{
    // 选择地址
    goSetAds(){
      this.$router.push({ path:'/adress'});
    },
    // 选择物料
    selThis(index){
      let arr = this.whichIndex;
      // 若存在重复的 则清除
      if(arr.includes(index)){
        arr.splice(arr.findIndex(item => item === index), 1);
        return;
      }
      arr.push(index);
    },
    // 确定选择物料
    cfmMater(){
      // 返回上层
      this.showMaterielPop = !this.showMaterielPop;
      // 赋值
      this.materList = [...this.whichIndex];
    },
    // 滑动删除
    delClick(index){
      let arr = this.materList;
      arr.splice(index, 1);
    }
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
  // 右箭头
  .r_arrow {
    right: 0;
    top: 50%;
    position: absolute;
    transform: translate(0, -50%);
  }  
  // 用户信息
  .user_info {
    color: #111;
    font-size: .2rem;
    font-weight: 500;
    // 用户姓名
    .user_name {
      margin-right: .08rem;
    }
    // 用户电话
    .user_tel {
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
  .icon-gengduo {
    top: 50%;
    right: .1rem;
    font-size: .24rem;
    position: absolute;
    transform: translate(0, -50%);
  }
  .title {
    color: #757575;
    font-weight: 200;
    font-size: .12rem;
  }
  .mode {
    color: #111;
    font-weight: 500;
  }
}
// 弹出层
#trade_pop_part {
  background: #fff;
  .trade_pop {
    padding: 0 .08rem;
    // 顶部
    .title {
      font-size: .2rem;
      position: relative;
      padding: 0.08rem 0 .14rem;
      // 搜索
      .search_part {
        width: 100%;
        display: flex;
        height: .3rem;
        line-height: .3rem;
        position: relative;
        // 搜索输入框
        .srh_inp {
          flex: 5;
          outline:none;
          border: none;
          color: #2D2D2D;
          font-size: .16rem;
          padding: 0 .3rem 0 .4rem;
          background: #F3F1F2;
          border-top-left-radius: .3rem;
          border-bottom-left-radius: .3rem;
        }
        // 取消 按钮
        .pop_cancel {
          flex: 1;
          color: #fff;
          font-size: .14rem;
          text-align: center;
          background: #fc3c3c;
          border-top-right-radius: .3rem;
          border-bottom-right-radius: .3rem;
        }
        // 搜索icon
        .serach_icon {
          top: 50%;
          left: 10px;
          fill: #2D2D2D;
          position: absolute;
          transform: translate(0, -50%);
        }
        // 清除icon
        .clear_icon {
          top: 50%;
          right: 14%;
          width: .3rem;
          height: .3rem;
          z-index: 100;
          display: block;
          font-size: .12rem;
          line-height: .3rem;
          text-align: center;
          position: absolute;
          transform: translate(0, -50%);
        }
      }
      // 关闭icon
      .close_icon {
        top: 50%;
        right: -2%;
        position: absolute;
        transform: translate(0, -50%);
      }
    }
    .each_mode {
      margin-right: .1rem;
      display: inline-block;
      padding: .04rem .2rem;
    }
    .vux-1px:before {
      border-radius: 40px;
    }
    // 物料列表
    .mater_list {
      width: 100%;
      padding-left: 10%;
      box-sizing: border-box;
      // 每个物料
      .each_mater {
        padding: 0.08rem;
        position: relative;
        margin-bottom: .2rem;
        box-sizing: border-box;
        // 物料名称
        .mater_name {
          color: #111;
          height: .46rem;     
          overflow: hidden;     
          font-size: .14rem;
          font-weight: bold;
          max-height: .46rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          text-overflow: ellipsis;
          -webkit-box-orient: vertical;
        }
        // 物料信息
        .mater_info {
          color: #757575;
          font-size: .12rem;
          // 规格 计量单位
          .speci,
          .Unit {
            margin-right: .2rem;
          }
        }
        // 选择icon
        .selIcon,
        .isSelIcon {
          top: 50%;
          left: -10%;
          position: absolute;
          transform: translate(0, -50%);
        }
        .isSelIcon {
          fill: #5077aa;
        }
      }
    }

  }
  // 确定
  .cfm_btn {
    left: 50%;
    bottom: 5%;
    width: 2.8rem;
    color: #fff;
    height: .44rem;
    line-height: .44rem;
    position: absolute;
    text-align: center;
    background: #5077aa;
    border-radius: .4rem;
    transform: translate(-50%,0);
    box-shadow: 0 2px 12px #5077aa;
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
      margin-bottom: .2rem;
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
          padding: 0 .1rem;
          font-size: .1rem;
          display:inline-block;
          background: #ea5455;
          vertical-align: middle;
          margin: -.01rem .04rem 0 0;
        }
      }
      // 物料信息
      .mater_info {
        color: #757575;
        font-size: .12rem;
        margin-top: .04rem;
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
            background:#3f72af;
          }
          .num {
            color: #111;  
            background: #dbe2ef;
          }
        }
        // 规格
        .mater_spec {
          @extend .mater_code;
          margin-left: .1rem;
          .title {
            color: #fff;
            background:#537791;
          }
          .num {
            color: #fff;
            background: #ff7f50;
          }
        }
      }
      // 用户输入
      .userInp_mode {
        color: #757575;
        .weui-cells {
          font-size: .14rem;
        }
        .weui-cells:after {
          border-bottom: none;
        }
        .vux-datetime {
          color: #757575;
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
}
// 底部栏
.count_mode {
  left: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  height: .44rem;
  position: fixed;
  line-height: .44rem;
  background: #fff;
  .count_num {
    flex: 2.5;
    color: #5077aa;
    font-size: .24rem;
    padding-left: .1rem;
  }
  .count_btn {
    flex: 1.5;
    color: #fff;
    text-align: center;
    background: #5077aa;
  }
}
.vux-1px-t:before {
  border-top: 1px solid #e8e8e8;
}

</style>
