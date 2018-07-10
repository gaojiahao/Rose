<template>
  <div class="pages">
    <!-- 用户地址和基本信息-->
    <div class="or_ads mg_auto box_sd" @click="goSetAds">
      <div class="user_info">
        <span class="user_name">刘治增</span>
        <span class="user_tel">15399909500</span>
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
        <popup v-model="showTransPop" height="70%" class="trade_pop_part">
          <div class="trade_pop">
            <div class="title">结算方式<x-icon class="close_icon" type="ios-close-empty" size="30" @click="showTransPop = !showTransPop"></x-icon></div>
            <span class="each_mode vux-1px" v-for="(item, index) in transMode" :key="index">{{item}}</span>
          </div>
          <div class="cfm_btn">确定</div>
        </popup>
      </div>
    </div>
    <!-- 物料列表 -->
    <div class="materiel_list mg_auto box_sd" @click="showMaterielPop = !showMaterielPop">
      <div class="title">物料列表</div>
      <div class="tips">请选择物料</div>
      <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
      <!-- 物料popup -->
      <div v-transfer-dom >
        <popup v-model="showMaterielPop" height="100%" class="trade_pop_part">
          <div class="trade_pop">
            <div class="title">物料列表<x-icon class="close_icon" type="ios-close-empty" size="30" @click="showMaterielPop = !showMaterielPop"></x-icon></div>
            <div class="mater_list" v-for="(item, index) in 10" :key='index' @click.stop="selThis(index)">
              <div class="each_mater box_sd">
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
        </popup>
      </div>
    </div>
    <div class="count_mode vux-1px-t">
      <span class="count_num">￥0</span>
      <span class="count_btn">提交订单</span>
    </div>
  </div>
</template>

<script>
import { Popup } from 'vux'
export default {
  components:{
    Popup
  },
  data(){
    return{
      whichIndex:[],                                 // 第几个被选中了
      isBeingSel:false,                              // 是否被选中
      isThisTrans:'现付',                             // 默认支付方式
      showTransPop:false,                            // 是否显示结算方式的popup
      showMaterielPop:false,                         // 是否显示物料的popup
      transMode:['现付','预付','账期','票据'],          // 结算方式
      logisticsTerm:['上门','自提','离岸','到港']       // 物流条款
      
    }
  },
  methods:{
    // 选择地址
    goSetAds(){
      this.$router.push({ path:'/adress'})
    },
    // 选择物料
    selThis(index){
      let arr = this.whichIndex;
      // 若存在重复的 则清除
      if(arr.includes(index)){
        arr.splice(arr.findIndex(item => item === index), 1)
        return;
      }
      arr.push(index);
      console.log(this.whichIndex);
    }
  }
}
</script>

<style lang='scss' scoped>
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
// 结算方式弹出层
.trade_pop_part {
  background: #fff;
  .trade_pop {
    padding: 0 .08rem;
    .title {
      font-size: .2rem;
      padding: 0.08rem 0;
      position: relative;
      .close_icon {
        right: 0;
        top: 50%;
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
      .each_mater {
        padding: 0.08rem;
        position: relative;
        margin-bottom: .2rem;
        box-sizing: border-box;
        // 物料名称
        .mater_name {
          color: #111;
          height: .46rem;          
          font-size: .14rem;
          font-weight: bold;
          max-height: .46rem;
          overflow: hidden;
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
          position: absolute;
          left: -10%;
          top: 50%;
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
  // 右箭头
  .r_arrow {
    top: 50%;
    right: .04rem;
    position: absolute;
    transform: translate(0, -50%);
  }  
}
.count_mode {
  left: 0;
  bottom: 0;
  width: 100%;
  height: .44rem;
  line-height: .44rem;
  display: flex;
  position: fixed;
  background: #fff;
  .count_num {
    flex: 2.5;
    color: #5077aa;
    font-size: .24rem;
    padding-left: .1rem;
  }
  .count_btn {
    text-align: center;
    background: #5077aa;
    color: #fff;
    flex: 1.5;
  }
}
.vux-1px-t:before {
  border-top: 1px solid #e8e8e8;
}
</style>
