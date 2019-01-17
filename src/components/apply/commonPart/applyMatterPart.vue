<template>
    <div class="materiel_list">
      <!-- 没有选择物料 -->
      <template v-if="!DataLength">
        <div @click="showPop = !showPop">
          <div class="title">{{orderListTitle}}列表</div>
          <div class="required">请选择{{orderListTitle}}</div>
          <i class="iconfont icon-youjiantou r_arrow"></i>
        </div>
      </template>
      <!-- 已经选择了物料 -->
      <template v-else>
        <div class="title" @click="showDelete">
          <div>{{orderListTitle}}列表</div>
          <div class='edit' v-if='!matterModifyClass'>编辑</div>
          <div class='finished' v-else>完成</div>
        </div>
        <div class="mater_list">
          <!-- 当传入的matterList是对象时 -->
          <template v-if="listIsObj">
            <div class="each_mater" :class="{'vux-1px-b' : index < DataLength - 1}"
                  v-for="(oItem, key, index) in matterList" :key="key">
              <div class="order_code" v-if='oItem.length && key !==  "noCode"'>
                <span class="order_title">{{orderListTitle}}</span>
                <span class="order_num">{{key}}</span>
              </div>
              <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                <matter-item :item="item" @on-modify="modifyMatter(item, index, key)" :show-delete="matterModifyClass"
                              @click.native="delClick(index, item, key)" :config="matterEditConfig.property">
                  <template slot="info" slot-scope="{item}">
                    <slot name="info" :item="item">
                      <div class='mater_other' v-if="item.price && item.tdQty">
                        <div class='mater_price'>
                          <span class="symbol">￥</span>{{item.price}}
                        </div>
                        <div>
                          <r-number :num="item.tdQty" :max="item.qtyBal" 
                                    :checkAmt='checkAmt' v-model="item.tdQty"></r-number>
                        </div>
                      </div>
                    </slot>
                  </template>
                  <template slot="editPart" slot-scope="{item}">
                    <div class="edit-part vux-1px-l" @click="modifyMatter(item, index, key)"
                          v-show="(item.price && item.tdQty) &&!matterModifyClass">
                      <span class='iconfont icon-bianji1'></span>
                    </div>
                  </template>
                </matter-item>
                <div class='delete_icon' @click="delClick(index, item, key)" v-if='matterModifyClass'>
                  <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                  <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                </div>
              </div>
            </div>
          </template>
          <!-- 当传入的matterList是数组时 -->
          <template v-else>
            <div class="each_mater" :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < DataLength - 1 }"
                v-for="(item, index) in matterList" :key='index'>
              <matter-item :item="item" @on-modify="modifyMatter(item, index)" :show-delete="matterModifyClass"
                            @click.native="delClick(index,item)" :config="matterEditConfig.property">
                <template slot="info" slot-scope="{item}">
                  <slot name="info" :item="item"></slot>
                </template>
                <template slot="edit" slot-scope="{item}">
                  <div class='mater_other' @click="modifyMatter(item, index)" v-if="!item.price && !matterModifyClass">
                    <div class="edit-tips">
                      <span class="tips-word">点击进行填写</span>
                    </div>
                  </div>
                </template>
              </matter-item>
              <div class='delete_icon' @click="delClick(index, item)" v-if='matterModifyClass'>
                <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
              </div>
            </div>
          </template>
        </div>
      </template>
      <!-- 新增更多 按钮 -->
      <div class="handle_part vx-1px-t" v-if="DataLength && !matterModifyClass">
        <span class="add_more stop" v-if="this.actions.includes('stop')"
              @click="stopOrder">终止提交</span>
        <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
        <span class="add_more" v-if="DataLength" @click="addMatter">新增更多物料</span>
      </div>
      <!-- 物料popup -->
      <pop-matter-list  :show="showPop" v-model="showPop" @shut-down-outsidePop="closePop" @sel-matter="selMatter" :config="matterPopConfig" 
                        :filter-list="filterList" :matter-params="matterParams" :default-value="defaultValue" ref="matter"></pop-matter-list>
    </div>
</template>

<script>
// 组件引入
import RNumber from 'components/RNumber'
import PopMatterList from 'components/Popup/PopMatterListTest'
import MatterItem from 'components/apply/commonPart/MatterItem'
export default {
  name: 'apply-matter-part',
  props: {
    checkAmt: {
      type: Function
    },
    actions: {
      type: Array,
      default() {
        return []
      }
    },
    btnInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    defaultValue: {
      type: Array,
      default() {
        return []
      }
    },
    matterPopConfig: {
      type: Array,
      default() {
        return []
      }
    },
    matterEditConfig: {
      type: Object,
      default() {
        return {}
      }
    },
    matterParams: {
      type: Object,
      default() {
        return {}
      }
    },
    // 筛选条件
    filterList: {
      type: Array,
      default() {
        return []
      }
    },
    // 新增物料
    addMatter: {
      type: Function,
      required: true
    },
    // 选择物料
    selMatter: {
      type: Function,
      required: true
    },
    // 编辑时显示图标
    showSelIcon: {
      type: Function,
      required: true
    },
    // 调用matter-pop组件 
    modifyMatter: {
      type: Function,
      required: true
    },
    // 删除选中物料
    delClick: {
      type: Function,
      required: true
    },
    // 显示删除
    showDelete: {
      type: Function,
      required: true
    },
    // 物料列表
    matterList: {
      type: [Array, Object],
    },
    // 编辑物料时 已选中的物料
    selItems: {
      type: Array,
      default() {
        return []
      }
    },
    // 抬头
    orderListTitle: {
      type: String,
      default: ''
    },
    // 是否显示物料选择器
    showMaterielPop: {
      type: Boolean,
      default: false
    },
    // 是否处于编辑物料状态
    matterModifyClass: {
      type: Boolean,
      default: false
    }
  },
  components: {
    RNumber, MatterItem, PopMatterList
  },
  computed: {
    // 计算数据长度
    DataLength() {
      let data = this.matterList;
      if(Object.prototype.toString.call(data) === '[object Object]') {
        return Object.keys(data).length;
      }
      else {
        return data.length;
      }
    },
    // 判断是否为对象
    listIsObj() {
      let data = this.matterList;
      return Object.prototype.toString.call(data) === '[object Object]';
    }
  },
  watch: {
    showMaterielPop(val) {
      this.showPop = val;
    }
  },
  methods: {
    closePop() {
      this.$emit('input', false);
    }
  },
  data() {
    return {
      showPop: this.showMaterielPop
    }
  }
}
</script>

<style scoped lang='scss'>
@import './../../scss/bizApply'
</style>
