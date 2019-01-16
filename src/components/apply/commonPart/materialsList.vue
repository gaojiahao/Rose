<template>
    <div class="materiel_list">
      <!-- 没有选择物料 -->
      <template v-if="!matterList.length">
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
          <div class="each_mater" :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1 }"
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
        </div>
      </template>
      <!-- 新增更多 按钮 -->
      <div class="handle_part vx-1px-t" v-if="matterList.length && !matterModifyClass">
        <span class="add_more stop" v-if="this.actions.includes('stop')"
              @click="stopOrder">终止提交</span>
        <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
        <span class="add_more" v-if="matterList.length" @click="showPop = !showPop">新增更多物料</span>
      </div>
      <!-- 物料popup -->
      <pop-matter-list  :show="showPop" v-model="showPop" @sel-matter="selMatter" :config="matterPopConfig" 
                        :matter-params="matterParams" :default-value="matterList" ref="matter"></pop-matter-list>
    </div>
</template>

<script>
// mixins 引入
import ApplyCommon from 'pageMixins/applyCommon'
// 组件引入
import PopMatterList from 'components/Popup/PopMatterListTest'
import MatterItem from 'components/apply/commonPart/MatterItem'
export default {
  name: 'apply-materials-List',
  props: {
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
    showSelIcon: {
      type: Function
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
    showDelete: {
      type: Function,
      required: true
    },
    // 物料列表
    matterList: {
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
    showMaterielPop: {
      type: Boolean,
      default: false
    },
    matterModifyClass: {
      type: Boolean,
      default: false
    }
  },
  components: {
    MatterItem, PopMatterList
  },
  computed: {
    // showPop() {
    //   return this.showMaterielPop;
    // }
  },
  data() {
    return {
      showPop: this.showMaterielPop
    }
  },
  activated() {
    
  }
}
</script>

<style scoped lang='scss'>
@import './../../scss/bizApply'
</style>
