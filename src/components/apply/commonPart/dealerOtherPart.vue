<template>
  <div class="dealer-other-part" v-if="config.length">
    <div v-for="(item,index) in config" :key="index">
      <!-- 结算方式, 物流条款 -->
      <pop-single-select :title="item.fieldLabel" :data="item.remoteData" :value="dealerInfo[item.fieldCode]" v-model="dealerInfo[item.fieldCode]" 
                        :isRequired="!item.allowBlank" v-if="!item.hiddenInRun && item.xtype === 'r2Combo' "></pop-single-select>
      <div class="mg_auto" v-if="!item.hiddenInRun">
        <div class="cell-item" v-if="item.readOnly && item.fieldCode !== 'projectType_project'">
          <div class="title">{{item.fieldLabel}}</div>
          <div class="mode">
            <span class="mode_content">{{dealerInfo[item.fieldCode] || "无"}}</span>
          </div>
        </div>
        <div v-else-if="!item.readOnly">
          <x-input class="cell-item" type="number" text-align='right' placeholder='请填写'
                v-model.number='dealerInfo[item.fieldCode]' @on-blur="checkAmt(dealerInfo)" v-if="item.xtype === 'r2Permilfield'">
          <span slot="label">{{item.fieldLabel}}</span>
          </x-input>
          <x-input class="cell-item" text-align='right' placeholder='请填写'
                  v-model.number='dealerInfo[item.fieldCode]' v-if="item.xtype === 'r2Textfield'">
            <span slot="label">{{item.fieldLabel}}</span>
          </x-input>
          <datetime class="cell-item" :title="item.fieldLabel" v-model="dealerInfo[item.fieldCode]" placeholder="请选择" 
                    v-if="item.xtype === 'r2Datefield'">
            <span slot="title">{{item.fieldLabel}}</span>
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
    }
  },
  data(){
    return{
      
    }
  },
  components: {
    PopSingleSelect, Datetime, XInput
  },
  watch: {
    dealerInfo: {
      handler(val){
        let { drDealerPaymentTerm } = val;          
        this.config.forEach(item => {
          if(item.fieldCode === 'tdAmountCopy1' || item.fieldCode === 'prepaymentDueDate'){
            if(drDealerPaymentTerm && drDealerPaymentTerm.includes('预收')) {
              item.hiddenInRun = false
              return
            }
            item.hiddenInRun = true
          }
        })
      },
      deep: true  
    },
    // dealerConfig: {
    //   handler(val) {
    //     this.config = val;
    //   },
    //   deep: true
    // }
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

