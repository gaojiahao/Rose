<template>
  <div class="dealer-other-part" v-if="config.length">
    <div v-for="(item,index) in config" :key="index">
      <!-- 结算方式, 物流条款 -->
      <pop-single-select :title="item.fieldLabel" :data="item.remoteData" :value="dealer[item.fieldCode]" v-model="dealer[item.fieldCode]"
                        :isRequired="!item.allowBlank" v-if="!item.hiddenInRun && item.xtype === 'r2Combo' "></pop-single-select>
      <div class="mg_auto" v-if="!item.hiddenInRun">
        <!-- 字段不能修改 -->
        <div class="cell-item" v-if="item.readOnly && item.fieldCode !== 'projectType_project'">
          <div class="title">{{item.fieldLabel}}</div>
          <div class="mode">
            <span class="mode_content">{{dealer[item.fieldCode] || "无"}}</span>
          </div>
        </div>
        <div v-else-if="!item.readOnly">
          <!-- 输入框（数字）-->
          <x-input class="cell-item" type="number" text-align='right' placeholder='请填写'
                v-model.number='dealer[item.fieldCode]' @on-blur="checkAmt(dealer)" v-if="item.xtype === 'r2Permilfield' || item.xtype === 'r2Numberfield'">
            <template slot="label">
              <span  class="title" :class="{required: !item.allowBlank}">{{item.fieldLabel}}</span>
            </template>  
          </x-input>
           <!-- 输入框（文字）-->
          <x-input class="cell-item" text-align='right' placeholder='请填写'
                  v-model.number='dealer[item.fieldCode]' v-if="item.xtype === 'r2Textfield'">
            <template slot="label">
              <span  class="title" :class="{required: !item.allowBlank}">{{item.fieldLabel}}</span>
            </template>  
          </x-input>
           <!-- 日期 -->
          <datetime class="cell-item" :title="item.fieldLabel" v-model="dealer[item.fieldCode]" placeholder="请选择" 
                    v-if="item.xtype === 'r2Datefield'">
            <template slot="title">
              <span  class="title" :class="{required: !item.allowBlank}">{{item.fieldLabel}}</span>
            </template>  
          </datetime>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import { Datetime, XInput} from 'vux'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
import {toFixed} from '@/plugins/calc'
export default {
  name: 'dealerOtherPart',
  props: {
    dealerConfig: {
      type: Array,
      default() {
        return []
      }
    },
    dealerInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    config(){
      return this.dealerConfig
    },
  },
  data(){
    return{
      dealer: {} 
    }
  },
  components: {
    PopSingleSelect, Datetime, XInput
  },
  watch: {
    // 监听父组件的传值，赋值给子组件的dealer
    dealerInfo(val) {
      this.dealer = {
        ...this.dealerInfo
      }
    },
    // 监听子组件的dealer,当修改了dealer中的值时，通知父组件修改
    dealer: {
      handler(val){
        let { drDealerPaymentTerm, crDealerPaymentTerm } = val;   
        // 当结算方式有值时，判断预付款和预付到期日是否显示  
        (drDealerPaymentTerm || crDealerPaymentTerm) && this.config.forEach(item => {
          if(item.fieldCode === 'tdAmountCopy1' || item.fieldCode === 'prepaymentDueDate' || item.fieldCode === 'advancePaymentDueDate'){
            if(drDealerPaymentTerm && drDealerPaymentTerm.includes('预收')) {
              item.hiddenInRun = false
              return
            }
            item.hiddenInRun = true
          }
        })
        let currentDealer = JSON.stringify(val),
            parentDealer = JSON.stringify(this.dealerInfo);
        if(currentDealer !== parentDealer){
          this.$emit('input', val)
        } 
      },
      deep: true  
    },
  },
  methods: {
    checkAmt(item) {
      let {tdAmountCopy1} = item;
      if(tdAmountCopy1) {
        item.tdAmountCopy1 = Math.abs(toFixed(tdAmountCopy1));
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.mg_auto {
  width: 95%;
  margin: 0 auto ;
  background: #fff;
}
.cell-item {
  background: #fff;
  box-sizing: border-box;
  padding: .02rem .1rem;
  display: flex;
  font-size: .14rem;
  align-items: center;
  justify-content: space-between;
  height: .36rem;
  line-height: .32rem;
  /deep/ .weui-cell__hd{
    color: #757575;
  }
  &:before {
    display: none;
  }
  .title {
    color: #757575;
    &.required {
      color: #5077aa;
    }
  }
  .mode {
    color: #111;
    font-weight: 500;
    display: flex;
    align-items: center;
    .mode_content {
      margin-right: .06rem;
    }
    .icon-shenglve {
      font-size: .2rem;
      color: #707070;
    }
  }
}

</style>

