<template>
  <div class="pages">
    <div class="d_top box_sd">
      <div class="top_img">
        <img src="../../assets/mater01.jpg" alt="materImg">
      </div>
      <div class="mater_info">
        <!-- 物料编码、规格 -->
        <div class="withColor">
          <!-- 物料编码 -->
          <div class="ForInline" style="display:inline-block; float:left;">
            <div class="mater_code">
              <span class="title">编码</span>
              <span class="num">CMGI1H1602100</span>
            </div>
          </div>
          <!-- 物料规格 -->
          <div class="ForInline" style="display:inline-block; float:right;">
            <div class="mater_spec">
              <span class="title">规格</span>
              <span class="num">直径38mm</span>
            </div>
          </div>
        </div>
        <!-- 物料名称 -->
        <div class="mater_name">
          2017加拿大纪念银币五百枚特别至尊版
        </div>
      </div>
    </div>
    <div class="d_main">
      <div class="d_classify vux-1px-b">
        <div class="father">
          <p class="title">物料大类:</p>
          <p class="content">金银套装</p>
        </div>
        <div class="child">
          <p class="title">物料子类:</p>
          <p class="content">物料</p>
        </div>
      </div>
      <div class="d_material vux-1px-b">
        <div class="father">
          <p class="title">加工属性:</p>
          <p class="content">原料</p>
        </div>
        <div class="child">
          <p class="title">材质:</p>
          <p class="content">其他</p>
        </div>
      </div>
      <div class="d_material vux-1px-b">
        <div class="father">
          <p class="title">颜色:</p>
          <p class="content">银</p>
        </div>
        <div class="child">
          <p class="title">单位:</p>
          <p class="content">箱</p>
        </div>
      </div>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEditAds">修改</div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang='scss' scoped>
// 阴影
.box_sd {
  box-sizing: border-box;
  box-shadow: 0 0 8px #e8e8e8;
}
// 下划线
.vux-1px-b:after{
  border-color: #e8e8e8;
}
// 下划线
.vux-1px-r:after{
  border-color: #e8e8e8;
}
// 顶部
.d_top {
  width: 90%;
  margin:.1rem auto 0;
  padding: .2rem 0 .1rem;
  // 物料图片
  .top_img {
    width: 1.2rem;
    height: 1.2rem;
    margin: 0 auto .1rem;
    img {
      width: 100%;
    }
  }
  // 物料信息
  .mater_info {
    width: 100%;
    // 有颜色包裹的
    .withColor {
      width: 2.2rem;
      margin: 0 auto;
      height: .24rem;
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
    // 物料名称
    .mater_name {
      width: 100%;
      color: #111; 
      padding: 0 .4rem;
      overflow: hidden;       
      font-size: .14rem;
      font-weight: bold;
      text-align: center; 
      max-height: .46rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      box-sizing: border-box;  
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
    }
  }
}
// 相关应用
.relevant_part {
  width: 90%;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  .each_app {
    flex: 1;
    display: flex;
    // flex-direction: column;
    text-align: center;
    // transform: scale(0.9)
  }
  .title{
    background: #3f72af;
    color: #fff;
  }
  .num {
    background: #dbe2ef;
  }
}
// 中部
.d_main {
  width: 90%;
  margin:0 auto; 
  .d_classify {
    display: flex;
    padding: 0.1rem 0;
    // height: .6rem;
    // line-height: .6rem;
    .father,
    .child {
      flex: 1;
      text-align: center;
    }
    .title {
      font-size: .12rem;
      color: #757575;
    }
    .content {
      padding-left: .04rem;
      font-weight: bold;
      font-size: .14rem;
    }
  }
  .d_material {
    @extend .d_classify;
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
  border-color:  #e8e8e8;
}
</style>
