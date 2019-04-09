<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
           <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
  </div>
</template>

<script>
// vux插件引入
import { dateFormat, XTextarea } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { getObjInvMoreUnitByInvCode } from 'service/materService'
import { updateData, submitAndCalc, saveAndStartWf, saveAndCommitTask } from 'service/common/commonService'
// mixins 引入
import applyCommon from 'mixins/applyCommon'
// 组件引入
import RNumber from 'components/public/RNumber'
import OpButton from 'components/apply/commonPart/OpButton'
import PopDealerList from 'components/Popup/PopDealerList'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
// 公共方法
import {toFixed} from '@/plugins/calc'
import {accAdd, accMul, accDiv, accSub} from 'plugins/calc/decimalsAdd'

const DRAFT_KEY = 'CGRK_DATA';

export default {
  name: 'ApplyCGRKForm',
  data() {
    return {
        filterList: [
            {
            name: '物料名称',
            value: 'inventoryName',
            }, {
            name: '物料编码',
            value: 'inventoryCode',
            },
            {
            name: '订单号',
            value: 'transCode',
            }
        ]
    }
  },
  mixins: [applyCommon],
  components: {
    XTextarea, RNumber,
    OpButton, PopBaseinfo, DealerOtherPart, 
    PopDealerList, PopWarehouseList, ApplyMatterPart
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizApply';
</style>
