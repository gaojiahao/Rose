<template>
  <div class="config-other-part" v-if="otherConfig.length">
    <div v-for="(item, index) in otherConfig" :key="index">
      <!-- 结算方式, 物流条款 -->
      <pop-single-select class="vux-1px-b" :title="item.fieldLabel" :data="item.remoteData" :value="other[item.fieldCode]" v-model="other[item.fieldCode]"
                        :isRequired="!item.allowBlank" v-if="!item.hiddenInRun && item.xtype === 'r2Combo' "></pop-single-select>
      <template v-if="!item.hiddenInRun">
        <!-- 字段不能修改 -->
        <div class="cell-item vux-1px-b" v-if="item.readOnly && item.fieldCode !== 'projectType_project'">
          <div class="title">{{item.fieldLabel}}</div>
          <div class="mode">
            <span class="mode_content">{{other[item.fieldCode] || "无"}}</span>
          </div>
        </div>
        <div v-else-if="!item.readOnly">
          <!-- 输入框（数字）-->
          <div class="cell-item vux-1px-b" v-if="item.xtype === 'r2Permilfield' || item.xtype === 'r2Numberfield'">
            <div class="title" :class="{required: !item.allowBlank}">{{item.fieldLabel}}</div>
            <div class="mode">
              <input type='number' placeholder="请输入" v-model.number="other[item.fieldCode]"/>
            </div>
          </div>
           <!-- 输入框（文字）-->
           <div class="cell-item vux-1px-b" v-if="item.xtype === 'r2Textfield'">
            <div class="title" :class="{required: !item.allowBlank}">{{item.fieldLabel}}</div>
            <div class="mode">
              <input type='text' placeholder="请输入" v-model="other[item.fieldCode]"/>
            </div>
          </div>
          <!-- 多行文本输入框 -->
          <div class="cell-item vux-1px-b" v-if="item.xtype === 'r2TextArea'">
            <div class="title" :class="{required: !item.allowBlank}">{{item.fieldLabel}}</div>
            <div class="mode">
              <input type='text' placeholder="请输入" ref="multiText" v-model="other[item.fieldCode]"/>
            </div>
          </div>
          <!-- 日期 -->
          <div class="cell-item vux-1px-b" v-if="item.xtype === 'r2Datefield'" @click="getDate(item)">
            <div class="title" :class="{required: !item.allowBlank}">{{item.fieldLabel}}</div>
            <div class="mode">
              <span class="mode_content">{{other[item.fieldCode] || "请选择"}}</span>
              <span class="icon-right"></span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { Datetime, XTextarea } from 'vux'
import { toFixed } from '@/plugins/calc'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
export default {
  name: 'otherConfigPart',
  components: { Datetime, XTextarea, PopSingleSelect },  
  props: {
    otherConfig: {
      type: Array,
      default() {
        return []
      }
    },
    otherInfo: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  data(){
    return{
      other: {},
    }
  },
  watch: {
    // 初始化基本信息
    otherInfo: {
      handler(val) {
        return this.other = {
          ...this.otherInfo
        }
      },
      immediate: true
    },
    // <子组件> 传值 <父组件>
    other: {
      handler(val) {
        let currentInfo = JSON.stringify(val), 
            parentInfo = JSON.stringify(this.otherInfo);
        if (currentInfo !== parentInfo) {
          this.$emit('input', val)
        }
      },
      deep: true
    }
  },
  methods: {
    // 选择日期
    getDate(dItem){
      this.$vux.datetime.show({
        value: '', // 其他参数同 props
        confirmText: '确认',
        cancelText: '取消',
        onConfirm: (val)=> {
          this.$set(this.other, dItem.fieldCode, val)
        },
      })
    },
    test() {
      // let [multiText] = this.$refs.multiText;
      // console.log(this.$refs.multiText);
      // multiText.style.height = `${multiText.scrollHeight}px`
    }
  }
}
</script>

<style lang="scss" scoped>
.config-other-part {
  background: #fff;
  padding: 0 .15rem;
  font-size: .14rem;
  color: #333;
  margin-bottom: .1rem;
  .vux-1px-b:after {
    border-color: #e8e8e8;
    left: 0;
  }
}
.cell-item {
  display: flex;
  line-height: .5rem;
  justify-content: space-between;
  input, textarea {
    width: 100%;
    border: none;
    outline: none;
    font-size: .14rem;
    text-align: right;
  }
  textarea {
    resize: none;
    height: .2rem;
    line-height: .2rem;
  }
  .title {
    color: #696969;
    max-width: .8rem;
    margin-right: .1rem;
    &.required {
      color: #3296FA;
      font-weight: bold;
    }
  }
  .mode {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .icon-right{
      width: .08rem;
      height: .14rem; 
      margin-left: .1rem;
    }
    
  }
}

</style>

