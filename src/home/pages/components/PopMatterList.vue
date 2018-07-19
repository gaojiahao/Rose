<template>
  <!-- 物料popup -->
  <div>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <div class="title">
          <!-- 搜索栏 -->
          <div class="search_part">
            <input class="srh_inp" type="text" v-model="srhInpTx">
            <div class="pop_cancel" @click="showPop = !showPop">返回</div>
            <x-icon class="serach_icon" type="ios-search" size="20"></x-icon>
            <icon class="clear_icon" type="clear" v-if="srhInpTx" @click.native="srhInpTx = ''"></icon>
          </div>
        </div>
        <!-- 物料列表 -->
        <div class="mater_list" ref="matter">
          <div>
            <div class="each_mater box_sd" v-for="(item, index) in matterList" :key='index'
                 @click.stop="selThis(item,index)">
              <div class="mater_img">
                <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
              </div>
              <div class="mater_main ">
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
              <!-- icon -->
              <x-icon class="selIcon" type="ios-circle-outline" size="20"></x-icon>
              <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="tmpIndexs.includes(index)"></x-icon>
            </div>
          </div>
        </div>
      </div>
      <!-- 底部栏 -->
      <div class="count_mode vux-1px-t">
        <span class="count_num"> {{tmpIndexs.length ? `已选 ${tmpIndexs.length} 个` : '请选择'}} </span>
        <span class="count_btn" @click="cfmMater">确定</span>
      </div>
    </popup>
  </div>
</template>

<script>
  import {Icon, Popup, LoadMore} from 'vux'
  import {getMatList} from './../../service/materService'
  import BScroll from 'better-scroll'

  export default {
    name: "MatterList",
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    components: {
      Icon, Popup, LoadMore,
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selIndexs: [], // 哪些被选中了
        tmpIndexs: [],
        matterList: [],
        bScroll: null,
        limit: 10,
        page: 1.,
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        }
      },
    },
    methods: {
      onShow() {
        this.$nextTick(() => {
          if (this.bScroll) {
            this.bScroll.refresh();
          }
        })
      },
      onHide() {
        this.tmpIndexs = [...this.selIndexs];
        this.$emit('input', false);
      },
      // 选择物料
      selThis(item, index) {
        let arr = this.tmpIndexs;
        // 若存在重复的 则清除
        if (arr.includes(index)) {
          arr.splice(arr.findIndex(item => item === index), 1);
          return;
        }
        arr.push(index);
      },
      // 确定选择物料
      cfmMater() {
        let sels = [];
        // 返回上层
        this.showPop = false;
        this.tmpIndexs.sort((a, b) => a - b);
        this.selIndexs = [...this.tmpIndexs];
        this.selIndexs.forEach(item => {
          sels.push(this.matterList[item]);
        });
        this.$emit('sel-matter', JSON.stringify(sels));
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('./../../assets/mater01.jpg');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 获取物料列表
      getMatList() {
        getMatList({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
        }).then(({tableContent = []}) => {
          tableContent.forEach(item => {
            item.inventoryPic = item.inventoryPic ? `/H_roleplay-si/ds/download?url=${item.inventoryPic}` : this.getDefaultImg();
          });
          this.matterList = tableContent;
          this.$nextTick(() => {
            this.bScroll.refresh();
          })
        })
      },
      // TODO 删除选中项
      delSelItem(index) {
        this.selIndexs.splice(index, 1);
        this.tmpIndexs = [...this.selIndexs];
      },
      // TODO 初始化滚动
      initScroll() {
        this.$nextTick(() => {
          this.bScroll = new BScroll(this.$refs.matter, {
            click: true,
          })
        })
      }
    },
    created() {
      this.initScroll();
      this.getMatList();
    }
  }
</script>

<style scoped lang="scss">
  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      padding: 0 .08rem;
      height: calc(100% - .44rem);
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
            outline: none;
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
        padding-left: 10%;
        width: 100%;
        height: calc(100% - .52rem);
        overflow: hidden;
        box-sizing: border-box;
        // 每个物料
        .each_mater {
          position: relative;
          display: flex;
          padding: 0.08rem;
          margin-bottom: .2rem;
          box-sizing: border-box;
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 0 8px #e8e8e8;
          }
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
      transform: translate(-50%, 0);
      box-shadow: 0 2px 12px #5077aa;
    }
  }
</style>
