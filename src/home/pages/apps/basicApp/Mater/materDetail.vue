<template>
  <div class="childPage">
    <div class="main_content">
      <!-- 大标题 -->
      <div class="big_title">
        <p class="vux-1px-b">基本信息</p>
      </div>
      <!-- 物料图片展示区域 -->
      <div class="d_top box_sd">
        <div class="top_img">
          <img :src="inventory.inventoryPic" alt="materImg" @error="getDefaultImg">
        </div>
        <div class="mater_info">
          <!-- 物料编码、规格 -->
            <!-- 当物料编码字节超过11个时 加载新的class -->
          <div class="withColor" :class="{'whenEleven' : inventory.inventoryCode && inventory.inventoryCode.length >= 11  }">
            <div class="justMid">
              <!-- 物料规格 -->
              <div class="ForInline">
                <div class="mater_spec">
                  <span class="title">规格</span>
                  <span class="num">{{inventory.specification || '无'}}</span>
                </div>
              </div>
              <!-- 物料编码 -->
              <div class="ForInline">
                <div class="mater_code">
                  <span class="title">编码</span>
                  <span class="num">{{inventory.inventoryCode}}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 物料名称 -->
          <div class="mater_name">
            {{inventory.inventoryName}}
          </div>
        </div>
      </div>
      <!-- 物料基本信息展示区域 -->
      <div class="d_main">
        <div class="d_classify vux-1px-b">
          <div class="father">
            <p class="title">物料大类:</p>
            <p class="content">{{inventory.inventoryType || '无'}}</p>
          </div>
          <div class="child">
            <p class="title">物料子类:</p>
            <p class="content">{{inventory.inventorySubclass || '无'}}</p>
          </div>
        </div>
        <div class="d_material vux-1px-b">
          <div class="father">
            <p class="title">加工属性:</p>
            <p class="content">{{inventory.processing}}</p>
          </div>
          <div class="child">
            <p class="title">材质:</p>
            <p class="content">{{inventory.material || '无'}}</p>
          </div>
        </div>
        <div class="d_material vux-1px-b">
          <div class="father">
            <p class="title">颜色:</p>
            <p class="content">{{inventory.inventoryColor || '无'}}</p>
          </div>
          <div class="child">
            <p class="title">单位:</p>
            <p class="content">{{inventory.measureUnit}}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 修改按钮 -->
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEdit">修改</div>
    </div>
  </div>
</template>

<script>
  import {AlertModule} from 'vux';
  import {findData} from 'service/materService'
  export default {
    name: 'materDetail',
    data() {
      return {
        transCode: '',
        inventory: {},
      }
    },
    methods: {
      // TODO 跳转到修改页面
      goEdit() {
        this.$router.push({
          path: '/materlist/addMater',
          query: {
            transCode: this.transCode
          }
        })
      },
      // TODO 获取物料详情
      findData() {
        return findData(this.transCode).then(({formData}) => {
          this.inventory = formData.inventory;
          let {inventoryPic} = this.inventory;
          if (inventoryPic) {
            this.inventory.inventoryPic = `/H_roleplay-si/ds/download?url=${inventoryPic}&width=400&height=400`
          } else {
            this.getDefaultImg();
          }
          this.$loading.hide();
        }).catch(e => {
          this.$loading.hide();
          AlertModule.show({
            content: e.message,
          })
        });
      },
      // TODO 获取默认图片
      getDefaultImg() {
        this.inventory.inventoryPic = require('assets/wl_default02.png');
      },
    },
    created() {
      this.$loading.show();
      let {transCode = ''} = this.$route.query;
      this.transCode = transCode;
      this.findData();
    }
  }
</script>

<style lang='scss' scoped>
  .main_content {
    overflow: auto;
    height: calc(100% - 10%);
    -webkit-overflow-scrolling: touch;
  }

  // 阴影
  .box_sd {
    box-sizing: border-box;
    box-shadow: 0 0 8px #e8e8e8;
  }

  // 下划线
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }

  // 下划线
  .vux-1px-r:after {
    border-color: #e8e8e8;
  }

  .big_title {
    width: 95%;
    color: #111;
    margin: 0 auto;
    padding: .04rem;
    font-size: .3rem;
    font-weight: 300;
    box-sizing: border-box;
  }

  // 顶部
  .d_top {
    width: 90%;
    margin: .1rem auto 0;
    padding: .2rem 0 .04rem;
    // 物料图片
    .top_img {
      width: 1.2rem;
      height: 1.2rem;
      margin: 0 auto;
      img {
        width: 100%;
        max-height: 100%;
      }
    }
    // 物料信息
    .mater_info {
      width: 100%;
      // 有颜色包裹的
      .withColor {
        width: 100%;
        height: .24rem;
        position: relative;
        .ForInline {
          display: inline-block;
        }
        // 居中
        .justMid {
          left: 50%;
          position: absolute;
          transform: translate(-50%, 0);
        }
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
            box-sizing: border-box;
          }
        }
        // 规格
        .mater_spec {
          @extend .mater_code;
          .num {
            color: #fff;
            max-width: .6rem;
            background: #ff7f50;
          }
        }
      }
      // 当编码的字节超过11个时
      .whenEleven {
        width: 100%;
        height: .52rem;
        position: relative;
        .ForInline {
          display: block;
        }
        //居中
        .justMid {
          left: 50%;
          display: flex;
          position: absolute;
          align-items: center;
          flex-direction: column;
          transform: translate(-50%, 0);
        }
        // 物料编码
        .mater_code {
          margin-top: .04rem;
          .title {
            color: #fff;
            background: #537791;
          }
          .num {
            color: #111;
            max-width: none;
            overflow: inherit;
            white-space: inherit;
            background: #dbe2ef;
            text-overflow: inherit;
            box-sizing: inherit;
          }
        }
        // 规格
        .mater_spec {
          @extend .mater_code;
          margin-left: 0;
          .num {
            color: #fff;
            background: #ff7f50;
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

  // 中部
  .d_main {
    width: 90%;
    margin: 0 auto .1rem;
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
        font-weight: bold;
        font-size: .14rem;
      }
    }
    .d_material {
      @extend .d_classify;
    }
  }

  // 相关应用
  .relevant_list {
    width: 90%;
    margin: 0 auto;
    .each_app {
      margin-bottom: .1rem;
      position: relative;
      border-radius: .08rem;
      .app_info {
        padding: .1rem;
        box-sizing: border-box;
        .title {
          color: #4F90F9;
          font-size: .12rem;
          font-weight: bold;
        }
        .app_name {
          font-size: .18rem;
          .msg_count {
            float: right;
            margin-right: .1rem;
          }
        }
        .msg_num {
          color: #3f72af;
          font-size: .2rem;
          .msg_tx {
            // color: #757575;
            font-size: .12rem;
          }
        }
        .r_arrow {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translate(0, -50%);
        }
      }
    }
  }

  // 确定
  .btn {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 10%;
    position: absolute;
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
    border-color: #e8e8e8;
  }
</style>
