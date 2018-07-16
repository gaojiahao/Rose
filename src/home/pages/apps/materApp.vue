<template>
  <div class="pages">
    <div class="content">
      <!-- 顶部区域 -->
      <div class="app_top">
        <!-- 搜索栏 -->
        <div class="search_part">
          <input class="srh_inp" type="text" v-model="srhInpTx">
          <div class="pop_cancel">搜索</div>
          <x-icon class="serach_icon" type="ios-search" size="20"></x-icon>
          <icon class="clear_icon" type="clear" v-if="srhInpTx" @click.native="srhInpTx = ''"></icon>
        </div>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in matNature" :key="index" :selected="index === 0">{{item}}</tab-item>
          </tab>
        </div>
      </div>
      <!-- 主要内容区域 -->
      <div class="app_main">
        <div class="each_mater" v-for="(item, index) in 2" :key='index' @click="goDetail">
          <div class="mater_img">
            <img src="../../assets/mater01.jpg" alt="mater_img">
          </div>
          <div class="mater_main vux-1px-b">
            <!-- 物料名称 -->
            <div class="mater_name">
              <span class="whiNum">No.{{index + 1}}</span>
              2017加拿大纪念银币五百枚特别至尊版
            </div>
            <!-- 物料基本信息 -->
            <div class="mater_info">
              <!-- 物料编码、规格 -->
              <div class="withColor">
                <!-- 物料编码 -->
                <div class="ForInline" style="display:inline-block">
                  <div class="mater_code">
                    <span class="title">编码</span>
                    <span class="num">CMGI1H1602100</span>
                  </div>
                </div>
                <!-- 物料规格 -->
                <div class="ForInline" style="display:inline-block">
                  <div class="mater_spec">
                    <span class="title">规格</span>
                    <span class="num">直径38mm</span>
                  </div>
                </div>
              </div>
              <!-- 物料分类、材质 -->
              <div class="withoutColor">
                <!-- 物料分类 -->
                <div class="mater_classify">
                  <span class="father">大类: 金银套装</span>
                  <span class="child">子类: 物料</span>
                </div>
                <!-- 物料材质等 -->
                <div class="mater_material">
                  <span class="unit">单位: 套</span>
                  <span class="color">颜色: 银</span>
                  <span class="spec">材质: 其他</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEditAds">填写另一条物料</div>
    </div>
  </div>
</template>

<script>
import { Tab, Icon, TabItem } from 'vux'
export default {
  components:{
    Tab, Icon, TabItem
  },
  data(){
    return{
      srhInpTx:'',
      matNature:['原料', '半成品', '成品', '商品', '服务', '虚拟件', '客供原料']
    }
  },
  methods:{
    goEditAds(){
      this.$router.push('/addMater');
    },
    goDetail(){
      this.$router.push({ path: '/materDetail'})
    }
  }
}
</script>

<style lang='scss'>
.content {
  height: 90%;
  overflow: auto;
}
.app_top {
  width: 100%;
  padding-top: .1rem;  
  // 搜索
  .search_part {
    width: 100%;
    display: flex;
    height: .3rem;
    padding: 0 .08rem;
    line-height: .3rem;
    position: relative;
    box-sizing: border-box;
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
      background: #3f72af;
      border-top-right-radius: .3rem;
      border-bottom-right-radius: .3rem;
    }
    // 搜索icon
    .serach_icon {
      top: 50%;
      left: .14rem;
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
  // 过滤
  .filter_part {
    margin-top: .04rem;
  }
}
.app_main {
  margin-top: .08rem;
  // 每个物料
  .each_mater {
    padding: .08rem;
    position: relative;
    box-sizing: border-box;
    display: flex;
    // 物料图片
    .mater_img {
      flex: 1;
      // margin-right: .2rem;
      display: inline-block;
      img {
        width: 100%;
      }
    }
    // 物料主体
    .mater_main {
      flex: 2;
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
              background:#3f72af;
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
              background:#537791;
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
    }
    // 下划线
    .vux-1px-b:after {
      border-bottom: 1px solid #e8e8e8;
    }
  }
}
// 确定
.btn {
  left: 0;
  bottom: 0;
  width: 100%;
  height: 10%;
  position: fixed;
  background: #fff;
  .cfm_btn {
    top: 50%;
    left: 50%;
    width: 2.8rem;
    color: #fff;
    height: .44rem;
    line-height: .44rem;
    position: absolute;
    text-align: center;
    background: #5077aa;
    border-radius: .4rem;
    transform: translate(-50%, -50%);
    box-shadow: 0 2px 5px #5077aa;
  }
}
// 上划线
.vux-1px-t:before {
  border-top: 1px solid #e8e8e8;
}
</style>
