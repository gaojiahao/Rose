<template>
  <div class="pages xsbj-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!--项目信息-->
        <div class="or_ads mg_auto" @click="showProjectPop = !showProjectPop">
          <div class="title">项目名称</div>
          <div v-if='projectName'>
            <div class="cp_info">
              <p class="cp_name">{{projectName}}</p>
            </div>
          </div>
          <div v-else>
            <div class="mode required">请选择项目名称</div>
          </div>
          <i class="iconfont icon-youjiantou r_arrow"></i>
        </div>
        <!-- 费用列表 -->
        <div class="materiel_list" v-for="(item, index) in CostList" :key='index'>
          <group :title='`费用明细${index+1}`' class='costGroup'>
            <cell title="费用名称" v-model='item.COST_NAME' is-link @click.native="getCost(index,item)">
              <template slot="title">
                <span class='required'>费用名称
                </span>
              </template>
            </cell>
            <!-- <popup-picker title="费用科目" :data="item.expSubjectList" v-model="item.expSubject"></popup-picker> -->
            <x-input title="金额" text-align='right' placeholder='请填写'
                     @on-blur="checkAmt(item)" type='number' v-model.number='item.price'>
              <template slot="label">
                <span class='required'>金额
                </span>
              </template>
            </x-input>
            <x-input type="text" title="报销事由" text-align='right' placeholder='请填写'v-model="item.reson"></x-input>
          </group>
        </div>
        <div class="materiel_list">
          <group title="其他信息" class="costGroup">
            <x-textarea title="备注" v-model="formData.biComment" :max="100"></x-textarea>
          </group>
        </div>
        <!-- 新增更多 按钮 -->
        <div class="add_more">
          您还需要添加新的报销?请点击
          <span class='add' @click="addCost">新增</span>
          <em v-show="CostList.length>1">或</em>
          <span class='delete' @click="deleteCost"  v-show="CostList.length>1">删除</span>
        </div>
        <!-- 费用popup -->
        <pop-cost-list :show="showCostPop" v-model="showCostPop" @sel-matter="selMatter" :defaultValue='selectedCost'
                       ref="matter"></pop-cost-list>
        <!--项目的popup-->
        <pop-project-list :show='showProjectPop' :default-value="defaultProject" v-model='showProjectPop'
                          @sel-project='selProject'></pop-project-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{totalAmount | numberComma(3)}}
      </span>
      <span class="count_btn stop" @click="stopOrder" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>终止</span>
      <span class="count_btn" @click="submitOrder">提交</span>
    </div>
  </div>
</template>

<script>
// vux插件引入
import { Cell ,Group,XInput, Swipeout,
         SwipeoutItem, SwipeoutButton,
         Popup, XTextarea, PopupPicker } from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
import {submitAndCalc, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
// mixins 引入
import ApplyCommon from 'pageMixins/applyCommon'
// 组件引入
import PopCostList from 'components/Popup/PopCostList'
import PopProjectList from 'components/Popup/PopProjectList'
// 方法引入
import {accAdd} from '@/home/pages/maps/decimalsAdd'
import {toFixed} from '@/plugins/calc'

const DRAFT_KEY = 'FYBX_DATA';
export default {
  mixins: [ApplyCommon],
  components: {
    Cell, Group, Popup,
    XInput, Swipeout, SwipeoutItem, XTextarea,
    SwipeoutButton, PopCostList, PopupPicker ,PopProjectList
  },
  data() {
    return {
      listId: 'b61ef324-f261-48d6-9c79-d1b475c24943',
      biComment:  '',
      biReferenceId:'',
      showCostPop :false,
      showProjectPop :false,
      CostList: [ // 费用列表
        {
          COST_NAME : '', //费用名称
          COST_CODE : '', //费用编码
          expSubject : '', //费用科目
          COST_TYPE : '', //费用类型
          price :'', //报销金额
          reson : '', // 报销事由
          comment :''
        }
      ],
      selectedCost:[],
      costIndex : 0,
      transCode: '',
      formData: {
        biComment: ''
      },
      projectName : '',//项目名称
      showPop: false,
      tmp: '',
      taxRate: 0, // 税率
      defaultProject: [],
    }
  },
  computed: {
    // 合计金额
    totalAmount() {
      let total = 0;
      this.CostList.forEach(item => {
        if (item.price) {
          total = accAdd(total, item.price);
        }
      });
      return total;
    }
  },
  methods: {
    getCost(index,item){
      this.showCostPop = true;
      this.costIndex = index;
      this.selectedCost = [item];
    },
    // TODO 点击增加费用
    addCost() {
      this.CostList.push({
        COST_NAME : '', //费用名称
        COST_CODE : '', //费用编码
        expSubject : '', //费用科目
        price :'', //报销金额
        reson : '', // 报销事由
        comment : ''
      })
    },
    //删除费用明细
    deleteCost(){
      this.CostList.pop();
    },
    // TODO 选中费用
    selMatter(val) {
      let sels = val;
      this.CostList[this.costIndex].COST_NAME = sels.COST_NAME;
      this.CostList[this.costIndex].COST_CODE = sels.COST_CODE;
      this.CostList[this.costIndex].expSubject = sels.COST_SUB_SUBJECTS.split(',')[0];
      this.CostList[this.costIndex].COST_TYPE = sels.COST_TYPE;
    },
    // TODO 选中项目
    selProject(val){
      this.projectName = val.PROJECT_NAME;
    },
    // TODO 提交
    submitOrder() {
      let warn = '';
      let dataSet = [];
      this.CostList.every(item => {
        if(!item.COST_NAME){
          warn = '请选择费用名称';
          return false
        }
        if (!item.price) {
          warn = '请输入报销金额';
          return false
        }
        // if(!item.reson){
        //   warn = '请输入报销事由'
        //   return false
        // }
        dataSet.push({
          tdId : item.tdId || '',
          costName_expCode: item.COST_NAME, //费用名称
          expCode: item.COST_CODE, //费用编码
          expSubject: item.expSubject , //费用科目
          costType_expCode: item.COST_TYPE || null, //费用类型
          tdAmount: item.price, //报销金额
          expCause : item.reson, // 报销事由
          comment : item.comment
        });
        return true
      });
      if (!this.projectName) {
        warn = '请选择项目';
      }
      if (warn) {
        this.$vux.alert.show({
          content: warn,
        });
        return
      }
      this.$vux.confirm.show({
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          this.$HandleLoad.show();
          let operation = saveAndStartWf;
          let wfPara = {
            [this.processCode]: {businessKey: "REIM1", createdBy: JSON.stringify(this.formData.handler)}
          }
          if (this.isResubmit) {
            wfPara = {
              businessKey: this.transCode,
              createdBy: this.formData.handler,
              transCode: this.transCode,
              result: 3,
              taskId: this.taskId,
              comment: ""
            }
          }
          let submitData = {
            listId: this.listId,
            biComment: '',
            formData: JSON.stringify({
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              creator: this.transCode ? this.formData.handler : '',
              modifer: this.transCode ? this.formData.handler : '',
              order: {
                crDealerLabel: '员工',
                project : this.projectName,
                dealerCodeCredit : this.formData.userCode,
                departmentName: this.formData.handlerUnitName,
                dataSet
              }
            }),
            wfPara: JSON.stringify(wfPara)
          };
          //重新提交
          if (this.isResubmit) {
            submitData.biReferenceId = this.biReferenceId;
            operation = saveAndCommitTask
          }
          //无工作流
          if(!this.processCode.length){
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
          this.saveData(operation, submitData);
        }
      });
    },
     //获取订单信息用于重新提交
    getFormData() {
        return getSOList({
          formViewUniqueId: this.uniqueId,
          transCode: this.transCode
        }).then((data) => {
          this.listId = data.listId;
          console.log(data);
          this.biComment = data.biComment;
          this.biReferenceId = data.biReferenceId;
          this.CostList = [];
          let {formData} = data;
          this.projectName = formData.order.project;
          //基本信息
          this.formData = {
            ...this.formData,
            creator: formData.creator,
            modifer: formData.modifer,
            biComment :formData.biComment,

          }
          //费用明细
          formData.order.dataSet.forEach(item=>{
            let obj = {
              COST_NAME : item.costName_expCode, //费用名称
              COST_CODE : item.expCode, //费用编码
              COST_TYPE :item.costType_expCode,
              expSubject : item.expSubject, //费用科目
              price :item.tdAmount, //报销金额
              reson : item.expCause, // 报销事由
              comment :item.comment,
              tdId : item.tdId
            }
            this.CostList.push(obj);
          })
          this.$loading.hide();
          // this.$emit('input', false);
        })
      },
    // TODO 保存草稿数据
    hasDraftData() {
      // 是否选择项目
      if (!this.projectName) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          cost: this.CostList,
          formData: this.formData,
          projectName: this.projectName,
        }
      };
    },
  },
  created() {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if(data){
      let draft = JSON.parse(data);
      this.CostList = draft.cost;
      this.formData = draft.formData;
      this.projectName = draft.projectName;
      this.defaultProject = [{PROJECT_NAME: this.projectName}];
      sessionStorage.removeItem(DRAFT_KEY);
    }
  },
}
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply.scss';
  .costGroup{
    /deep/ > .vux-no-group-title {
      margin-top: 0.08rem;
    }
    /deep/ > .weui-cells:after {
      border-bottom: none;
    }
    .vux-cell-box{
      /deep/ > .weui-cell {
        padding: 10px 0;
      }
      &:before {
        left: 0;
      }

    }
    .weui-cell {
      padding: 10px 0;
      &:before {
        left: 0;
      }
    }
  }
    /deep/ >.weui-cells__title{
      padding-left: 0;
      font-size:0.12rem;
    }
  .add_more{
    width:100%;
    text-align: center;
    font-size: 0.12rem;
    padding: 0.1rem 0;
    color: #757575;
    span{
      margin: 0 5px;
      color: #fff;
      padding: .01rem .06rem;
      border-radius: .12rem;
    }
    .add{
      background: #5077aa;
    }
    .delete{
      background:red;
    }
    em{
      font-style: normal;
    }
  }
</style>
