<template>
  <!-- 往来 其他相关配置（基于动态渲染） -->
  <div class="dealer-other-part" v-if="config.length">
    <div :class="{'vux-1px-b': index > 0}" v-for="(item, index) in config" :key="index"  v-show="!item.hiddenInRun">
      <!-- 结算方式, 物流条款 -->
      <pop-single-select class="vux-1px-b" :title="item.fieldLabel" :data="item.remoteData" :value="dealer[item.fieldCode]" v-model="dealer[item.fieldCode]"
                        :isRequired="!item.allowBlank" v-if="!item.hiddenInRun && item.xtype === 'r2Combo' "></pop-single-select>
      <!-- 字段不能修改 -->
      <div class="cell-item" v-if="item.readOnly && item.fieldCode !== 'projectType_project'">
        <div class="title">{{item.fieldLabel}}</div>
        <div class="mode">
          <span class="mode_content">{{dealer[item.fieldCode] || "无"}}</span>
        </div>
      </div>
      <div v-else-if="!item.readOnly">
        <!-- 输入框（数字）-->
        <div class="cell-item" v-if="item.xtype === 'r2Permilfield' || item.xtype === 'r2Numberfield'">
          <div class="title" :class="{required: !item.allowBlank}">{{item.fieldLabel}}</div>
          <div class="mode">
            <input type='number' placeholder="请输入" v-model.number="dealer[item.fieldCode]" @on-blur="checkAmt(dealer)"/>
          </div>
        </div>
        <!-- 输入框（文字）-->
        <div class="cell-item"  v-if="item.xtype === 'r2Textfield'">
          <div class="title" :class="{required: !item.allowBlank}">{{item.fieldLabel}}</div>
          <div class="mode">
            <input type='text' placeholder="请输入" v-model="dealer[item.fieldCode]" @on-blur="checkAmt(dealer)"/>
          </div>
        </div>
        <!-- 日期 -->
        <div class="cell-item"  v-if="item.xtype === 'r2Datefield'" @click="getDate(item)">
          <div class="title" :class="{required: !item.allowBlank}">{{item.fieldLabel}}</div>
          <div class="mode">
            <span class="mode_content">{{dealer[item.fieldCode] || "请选择"}}</span>
            <span class="icon-right"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Datetime, XInput } from 'vux'
import { toFixed } from '@/plugins/calc'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
export default {
  name: 'dealerOtherPart',
  props: {
    dealerConfig: {
      type: Array,
      default() {
        return []
      },
      required: true
    },
    dealerInfo: {
      type: Object,
      default() {
        return {}
      },
      required: true
    }
  },
  computed: {
    config(){
      return this.dealerConfig
    },
  },
  data(){
    return{
      dealer: {},
    }
  },
  components: {
    PopSingleSelect, Datetime, XInput
  },
  watch: {
    // 监听父组件的传值，赋值给子组件的dealer
    dealerInfo: {
      handler(val){
        this.dealer = { ...this.dealerInfo }
      },
      immediate: true
    },
    // 监听子组件的dealer,当修改了dealer中的值时，通知父组件修改
    dealer: {
      handler(val) {
        let currentDealer = JSON.stringify(val), 
            parentDealer = JSON.stringify(this.dealerInfo);

        // 根据结算方式 判断其他配置是否显示
        this.verifyPayments(val);

        // 是否已修改数据 若修改则传值回父组件
        if (currentDealer !== parentDealer){
          this.$emit('input', val)
        } 
      },
      deep: true,
      immediate: true
    },
  },
  methods: {
    checkAmt(item) {
      let {tdAmountCopy1} = item;
      if (tdAmountCopy1) {
        item.tdAmountCopy1 = Math.abs(toFixed(tdAmountCopy1));
      }
    },
    // 选择日期
    getDate(dItem){
      this.$vux.datetime.show({
        value: '', // 其他参数同 props
        confirmText: '确认',
        cancelText: '取消',
        onConfirm: (val)=> {
          this.$set(this.dealer, dItem.fieldCode, val)
        },
      })
    },
    // 校验 *结算方式* 判断 <预付款>/<预付到期日>/账期 等 是否显示
    verifyPayments(val) {
      let { drDealerPaymentTerm, crDealerPaymentTerm } = val;  
      this.config.forEach(item => {
        // 根据结算方式 判断 <预付款> 和 <预付到期日> 是否显示  
        if (item.fieldCode === 'tdAmountCopy1' || item.fieldCode.includes('paymentDueDate')){
          if (drDealerPaymentTerm && drDealerPaymentTerm.includes('预收')) {
            item.hiddenInRun = false;
            return;
          }
          item.hiddenInRun = true
        }
        // 根据结算方式 判断 <账期> 是否显示  
        if (item.fieldCode.includes('pamentDays')) {
          if (crDealerPaymentTerm && crDealerPaymentTerm.includes('账期')) {
            item.hiddenInRun = false;
            return;
          }
          item.hiddenInRun = true;
        }
      })
    }
  },
  updated() {
    // 根据结算方式 初始化其他配置
    this.verifyPayments(this.dealer);
  }
}
</script>

<style lang="scss" scoped>
.dealer-other-part {
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
  height: .5rem;
  line-height: .5rem;
  justify-content: space-between;
  input {
    width: 100%;
    font-size: .14rem;
    outline: none;
    border: none;
    text-align: right;
  }
  .title {
    color: #696969;
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

