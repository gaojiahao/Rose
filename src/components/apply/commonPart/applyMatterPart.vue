<template>
  <!-- 物料相关组件集合（物料选择器、物料编辑器、物料删除等） -->
  <div class="materiel-list">
    <!-- 没有选择物料 -->
    <template v-if="!DataLength">
      <div class="no-matter" @click="showPop = !showPop">
        <div class="title">{{orderListTitle ? orderListTitle : '物料'}}列表</div>
        <div class="seleted_icon">
          请选择<span class="icon-right"></span>
        </div>
      </div>
    </template>
    <!-- 已经选择了物料 -->
    <template v-else>
      <div class="has-matter" @click="showDeleteFn">
        <div class="title">{{orderListTitle ? orderListTitle : '物料'}}列表</div>
        <div class='edit' v-if='!matterModifyClass'>编辑</div>
        <div class='edit' v-else>完成</div>
      </div>
      <div class="mater-list">
        <!-- 当传入的matterList是对象时 -->
        <template v-if="listIsObj">
          <div class="each_mater" :class="{'vux-1px-t' : index > 0}"
                v-for="(oItem, key, index) in matterList" :key="key">
            <div class="order_code" v-if='oItem.length && key !==  "noCode"'>
              {{orderListTitle}}：{{key}}
            </div>
            <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
              <matter-item :item="item" @on-modify="getMatterModifyFn(item, index, key)" :show-delete="matterModifyClass"
                            @click.native="delClickFn(item, index, key)" :config="matterEditConfig.property">
                <template slot="info" slot-scope="{item}">
                  <slot name="info" :item="item">
                    <div class='mater_other' v-if="item.price && item.tdQty">
                      <div class='mater_price'>
                        <span class="symbol" v-show="!isNaN(item.price)">￥</span>{{item.price}}
                      </div>
                      <slot name="rNumber" :item="item">
                        <r-number :num="item.tdQty" :max="item[maxField]" v-model="item.tdQty"></r-number>
                      </slot>
                    </div>
                  </slot>
                </template>
              </matter-item>
              <div class='delete_icon' @click="delClickFn(item, index, key)" v-if='matterModifyClass'>
                <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIconFn(item, index)"></x-icon>
                <x-icon type="ios-circle-outline" size="20" v-show="!showSelIconFn(item, index)"></x-icon>
              </div>
            </div>
          </div>
        </template>
        <!-- 当传入的matterList是数组时 -->
        <template v-else>
          <div class="each_mater" :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < DataLength - 1 }"
              v-for="(item, index) in matterList" :key='index'>
            <matter-item :item="item" @on-modify="getMatterModifyFn(item, index)" :show-delete="matterModifyClass"
                          @click.native="delClickFn(item, index)" :config="matterEditConfig.property">
              <template slot="info" slot-scope="{item}">
                <slot name="info" :item="item"></slot>
              </template>
            </matter-item>
            <div class='delete_icon' @click="delClickFn(item, index)" v-if='matterModifyClass'>
              <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIconFn(item, index)"></x-icon>
              <x-icon type="ios-circle-outline" size="20" v-show="!showSelIconFn(item, index)"></x-icon>
            </div>
          </div>
        </template>
      </div>
    </template>
    <!-- 新增更多 按钮 -->
    <div :class="[isSubmitAgain ? 'resubmit-part' : 'sumbit-part']" v-if="DataLength && !matterModifyClass">
      <div class="add_more" v-if="DataLength" @click="addMatterFn">
        <span class="icon-add"></span>
        <span class="add_text">新增更多物料</span>
      </div>
      <span class="add_more stop" v-if="this.actions.includes('stop')" @click="stopOrderFn">终止提交</span>
    </div>
    <!-- 物料popup -->
    <pop-matter-list  :show="showPop" v-model="showPop" @shut-down-outsidePop="closePop" @sel-matter="selMatterFn" :config="matterPopConfig"
                      :order-title="orderListTitle" :filter-list="filterList" :matter-params="matterParams" :default-value="defaultValue" ref="matter"></pop-matter-list>
    <!-- 物料编辑 -->
    <pop-matter :chosen-matter='chosenMatter' :show-pop="showModifyPop" @sel-confirm='selConfirmFn' @show-down-modify="closeModify"
                v-model='showModifyPop' :btn-is-hide="btnIsHide" :config="matterEditConfig" :check-amt="checkAmtFn">
    </pop-matter>
  </div>
</template>

<script>
// 组件引入
import RNumber from 'components/public/RNumber'
import PopMatter from 'components/apply/commonPart/MatterPop'
import PopMatterList from 'components/Popup/matter/PopMatterList'
import MatterItem from 'components/apply/commonPart/MatterItem'
export default {
  name: 'apply-matter-part',
  props: {
    // 数字校验方法（根据每个应用的业务情况不同，建议单独撰写一份）
    checkAmtFn: {
      type: Function
    },
    // 用户的权限（新增、修改、删除等）
    actions: {
      type: Array,
      default() {
        return []
      }
    },
    // 同actions一致
    btnInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    // 物料选择器 默认值
    defaultValue: {
      type: Array,
      default() {
        return []
      }
    },
    // 物料选择器 动态渲染配置
    matterPopConfig: {
      type: Array,
      default() {
        return []
      }
    },
    // 物料编辑器 动态渲染配置
    matterEditConfig: {
      type: Object,
      default() {
        return {}
      }
    },
    // 物料选择器 相关请求配置
    matterParams: {
      type: Object,
      default() {
        return {}
      }
    },
    // 被选中 进行编辑修改的物料
    chosenMatter: {
      type: Object,
      default() {
        return {}
      }
    },
    // 物料修改器 —— 确认按钮
    selConfirmFn: {
      type: Function,
      required: true
    },
    // 筛选条件
    filterList: {
      type: Array,
      default() {
        return []
      }
    },
    // 新增物料
    addMatterFn: {
      type: Function,
      required: true
    },
    // 终止提交
    stopOrderFn: {
      type: Function
    },
    // 选择物料
    selMatterFn: {
      type: Function,
      required: true
    },
    // 编辑时显示图标
    showSelIconFn: {
      type: Function,
      required: true
    },
    // 调用matter-pop组件
    getMatterModifyFn: {
      type: Function,
      required: true
    },
    // 删除选中物料
    delClickFn: {
      type: Function,
      required: true
    },
    // 显示删除
    showDeleteFn: {
      type: Function,
      required: true
    },
    // 物料列表
    matterList: {
      type: [Array, Object],
    },
    // 编辑物料时 已选中的物料
    selItems: {
      type: [Array, Object],
    },
    // 抬头
    orderListTitle: {
      type: String,
      default: ''
    },
    // 是否显示物料<选择器>
    showMaterielPop: {
      type: Boolean,
      default: false
    },
    // 是否显示物料<编辑器>
    showMatterPop: {
      type: Boolean,
      default: false
    },
    // 是否处于编辑物料状态
    matterModifyClass: {
      type: Boolean,
      default: false
    },
    btnIsHide: {
      type: Boolean,
      default: false
    },
    // 数字框r-number绑定的最大值
    maxField: {
      type: String,
      default: 'qtyBal'
    }
  },
  components: {
    RNumber, PopMatter,
    MatterItem, PopMatterList
  },
  computed: {
    // 判断是否为对象
    listIsObj() {
      let data = this.matterList;
      return Object.prototype.toString.call(data) === '[object Object]';
    },
    isSubmitAgain() {
      return this.btnInfo.isMyTask === 1 && this.btnInfo.actions.includes("stop")
    }
  },
  watch: {
    showMaterielPop(val) {
      this.showPop = val;
    },
    showMatterPop(val) {
      this.showModifyPop = val;
    },
    matterList: {
      // 计算数据长度
      handler(data) {
        if (Object.prototype.toString.call(data) === '[object Object]') {
          this.DataLength = Object.keys(data).length;
        }
        else {
          this.DataLength = data.length;
        }
      },
      deep: true,
      immediate: true
    },
  },
  methods: {
    closePop() {
      this.$emit('input', false);
    },
    closeModify() {
      this.$emit('show-down-modify-pop', false);
    }
  },
  data() {
    return {
      DataLength: 0,
      showPop: false,              // 物料选择器
      showModifyPop: false,          // 物料信息编辑器
    }
  },
}
</script>

<style scoped lang='scss'>
.materiel-list {
  padding: 0 .15rem;
  font-size: .14rem;
  position: relative;
  background: #FFF;
  margin-bottom: .1rem;
  box-sizing: border-box;
  // 没有物料title样式
  .no-matter {
    display: flex;
    padding: .18rem 0;
    font-size: .14rem;
    line-height: .14rem;
    justify-content: space-between;
    .title{
      color: #3296FA;
      font-weight: bold;
    }
    .seleted_icon {
      display: flex;
      align-items: center;
      .icon-right {
        width: .08rem;
        height: .14rem;
        margin-left: .1rem;
      }
    }
  }
  // 有物料的title的样式
  .has-matter {
    display: flex;
    padding-top: .2rem;
    line-height: .14rem;
    justify-content: space-between;
    .title {
      color: #696969;
    }
    .edit {
      color: #333;
    }

  }
  // 物料列表
  .mater-list {
    box-sizing: border-box;
    .vux-1px-b:after {
      border-bottom: 1px solid #e8e8e8;
    }
    // 每个物料
    .each_mater {
      position: relative;
      box-sizing: border-box;
      // 计划号
      .order_code {
        padding-top: .16rem;
        color: #999;
        font-size: .12rem;
        line-height: .12rem;
      }
    }
    .mater_delete{
      position: relative;
      padding-left: 0.3rem;
    }
    .delete_icon{
      left: 0;
      top: 50%;
      height: 20px;
      fill: #999;
      position: absolute;
      transform: translateY(-50%);
      .checked{
        fill: #FA7138;
      }
    }
  }
  .mater_other {
    display: flex;
    margin-top: .1rem;
    align-items: center;
    position: relative;
    justify-content: space-between;
    //内容可编辑提示
    .edit-tips{
      font-size: 0.12rem;
      color: #454545;
      font-weight: bold;
      .icon-tianxie {
        font-size: .14rem;
      }
      .tips-word {
        font-size: .12rem;
      }
    }
    .mater_price {
      color: #FA7138;
      font-weight: bold;
      font-size: .16rem;
      line-height: .2rem;
      display: inline-block;
    }
    .matter-remain {
      color: #111;
      font-size: .14rem;
      font-weight: bold;
      .symbol {
        color: #757575;
      }
      .icon--{
        font-size: 0.14rem;
      }
    }
  }
  // 新增更多
  .sumbit-part {
    width: 100%;
    display: flex;
    text-align: center;
    position: relative;
    .add_more {
      display: flex;
      color: #3296FA;
      font-weight: bold;
      text-align: center;
      align-items: center;
      margin: 0 auto .2rem;
      border-radius: .15rem;
      padding: .06rem .08rem;
      border: 1px solid #3296FA;
      .icon-add {
        width: .14rem;
        height: .14rem;
        margin-right: .05rem;
        box-sizing: border-box;
      }
      .add_text {
        font-size: .12rem;
        line-height: .12rem;
      }
    }
    .symbol {
      left: 50%;
      bottom: 25%;
      color: #757575;
      font-size: .12rem;
      position: absolute;
      transform: translate(-50%, 0);
    }
    .native {
      margin-right: .24rem;
      background: #ea5455;
      box-shadow: 0 2px 5px #ea5455;
    }

  }
  .resubmit-part {
    width: 100%;
    display: flex;
    padding: .1rem 0;
    font-size: .12rem;
    text-align: center;
    position: relative;
    justify-content: flex-end;
    .add_more {
      color: #FFF;
      font-weight: bold;
      text-align: center;
      background: #3296FA;
      border-radius: .04rem;
      padding: .08rem .04rem;
      &.stop {
        color: #a1a1a1;
        background: #dfdfdf;
      }
      & + .add_more {
        margin-left: .1rem;
      }
    }
  }
}

</style>
