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
      <!-- 物料列表 -->
      <div class="materiel_list mg_auto box_sd">
        <!-- 没有选择物料 -->
        <template v-if="!matterList.length">
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
            <div class="each_mater vux-1px-b" v-for="(item, index) in matterList" :key='index'>
              <swipeout>
                <swipeout-item>
                  <div slot="right-menu">
                    <swipeout-button @click.native="delClick(index)" type="warn">删除</swipeout-button>
                  </div>
                  <div class="each_mater_wrapper" slot="content">
                    <!--<div class="mater_name">
                      <span class="whiNum">No.{{index + 1}}</span>
                      2017加拿大纪念银币（鸡）五百枚特别至尊版封装评级证书
                    </div>
                    <div class="mater_info">
                      <div class="ForInline" style="display:inline-block">
                        <div class="mater_code">
                          <span class="title">物料编码</span>
                          <span class="num">CMGI1H1602100</span>
                        </div>
                      </div>
                      <div class="ForInline" style="display:inline-block">
                        <div class="mater_spec">
                          <span class="title">规格</span>
                          <span class="num">80*110</span>
                        </div>
                      </div>
                    </div>-->
                    <div class="mater_img">
                      <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
                    </div>
                    <div class="mater_main vux-1px-b">
                      <!-- 物料名称 -->
                      <div class="mater_name">
                        <span class="whiNum">No.{{index + 1}}</span>
                        {{item.inventoryName}}
                      </div>
                      <!-- 物料基本信息 -->
                      <div class="mater_info">
                        <!-- 物料编码、规格 -->
                        <div class="withColor">
                          <!-- 物料编码 -->
                          <div class="ForInline" style="display:inline-block">
                            <div class="mater_code">
                              <span class="title">编码</span>
                              <span class="num">{{item.inventoryCode}}</span>
                            </div>
                          </div>
                          <!-- 物料规格 -->
                          <div class="ForInline" style="display:inline-block">
                            <div class="mater_spec">
                              <span class="title">规格</span>
                              <span class="num">{{item.specification}}</span>
                            </div>
                          </div>
                        </div>
                        <!-- 物料分类、材质 -->
                        <div class="withoutColor">
                          <!-- 物料分类 -->
                          <div class="mater_classify">
                            <span class="father">大类: {{item.inventoryType}}</span>
                            <span class="child">子类: {{item.inventorySubclass}}</span>
                          </div>
                          <!-- 物料材质等 -->
                          <div class="mater_material">
                            <span class="unit">单位: {{item.measureUnit}}</span>
                            <span class="color">颜色: {{item.inventoryColor}}</span>
                            <span class="spec">材质: {{item.material}}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </swipeout-item>
              </swipeout>
              <!-- 物料输入内容 -->
              <div class="userInp_mode">
                <group>
                  <x-input type="number" title="数量" text-align='right' placeholder='请填写' v-model="item.count"></x-input>
                </group>
              </div>
            </div>
          </div>
        </template>
        <!-- 新增更多 按钮 -->
        <div class="add_more" v-if="matterList.length" @click="showMaterielPop = !showMaterielPop">新增更多物料</div>
        <!-- 物料popup -->
        <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                         ref="matter"></pop-matter-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">提交订单</div>
    </div>
  </div>
</template>

<script>
  import {Icon, Cell, Group, XInput, Swipeout, SwipeoutItem, SwipeoutButton} from 'vux'
  import PopMatterList from './../../components/PopMatterList'

  export default {
    components: {
      Icon, Cell, Group, XInput, Swipeout, SwipeoutItem, SwipeoutButton, PopMatterList
    },
    data() {
      return {
        matterList: [],  // 物料列表
        showMaterielPop: false, // 是否显示物料的popup
      }
    },
    methods: {
      // TODO 选择地址
      goSetAds() {
        this.$router.push({path: '/adress'});
      },
      // TODO 滑动删除
      delClick(index) {
        let arr = this.matterList;
        arr.splice(index, 1);
        this.$refs.matter.delSelItem(index);
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        this.matterList = [...sels];
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('./../../../assets/mater01.jpg');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 提交
      save() {
      },
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
    height: 90%;
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
          }
          // 下划线
          .vux-1px-b:after {
            border-bottom: 1px solid #e8e8e8;
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

</style>
