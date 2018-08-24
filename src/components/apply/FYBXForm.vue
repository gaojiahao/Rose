<template>
  <div class="pages xsbj-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!--项目信息-->
        <div class="or_ads mg_auto box_sd" @click="showProjectPop = !showProjectPop">
          <div class="title">项目名称</div>
          <div v-if='project.name'>
            <div class="cp_info">
              <p class="cp_name">{{project.name}}</p>
            </div>
          </div>
          <div v-else>
            <div class="mode">请选择项目名称</div>
          </div>
          <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
        </div>
        <!-- 费用列表 -->
        <div class="materiel_list mg_auto box_sd" v-for="(item, index) in CostList" :key='index'>
          <group :title='`费用明细${index+1}`' class='costGroup'>
            <cell title="费用名称" v-model='item.COST_NAME' is-link @click.native="getCost(index,item)"></cell>
            <popup-picker title="费用科目" :data="item.expSubjectList" v-model="item.expSubject"></popup-picker>
            <x-input title="金额" text-align='right' placeholder='请填写'
                     type='number'v-model='item.price'>
            </x-input>
            <x-input type="text" title="报销事由" text-align='right' placeholder='请填写'v-model="item.reson"></x-input>
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
        <pop-project-list :show='showProjectPop' v-model='showProjectPop' @sel-project='selProject'></pop-project-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{totalAmount | numberComma(3)}}
      </span>
      <!-- <span class="count_btn stop" @click="stopOrder" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>终止</span> -->
      <span class="count_btn" @click="submitOrder">提交</span>
    </div>
  </div>
</template>

<script>
// vux插件引入
import { Cell ,Group,XInput, Swipeout, SwipeoutItem, SwipeoutButton,Popup,PopupPicker } from 'vux'
// 请求 引入
import {submitAndCalc, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
// mixins 引入
import ApplyCommon from './../mixins/applyCommon'
// 组件引入
import PopCostList from 'components/Popup/PopCostList'
import PopProjectList from 'components/Popup/PopProjectList'
export default {
  mixins: [ApplyCommon],
  components: { 
    Cell, Group, Popup,
    XInput, Swipeout, SwipeoutItem,
    SwipeoutButton, PopCostList, PopupPicker ,PopProjectList
  },
  data() {
    return {
      showCostPop :false,
      showProjectPop :false,
      CostList: [ // 费用列表
        {
          COST_NAME : '', //费用名称
          COST_CODE : '', //费用编码
          expSubject : [], //费用科目
          expSubjectList : [],//费用科目列表
          COST_TYPE : '', //费用类型
          price :'', //报销金额
          reson : '', // 报销事由
        }
      ], 
      selectedCost:[],
      costIndex : 0, 
      transCode: '',
      formData: {
        biComment: ''
      },
      project:{},//项目名称
      showPop: false,
      tmp: '',
      taxRate: 0, // 税率
    }
  },
  computed: {
    // 合计金额
    totalAmount() {
      let total = 0;
      this.CostList.forEach(item=>{
        if(item.price){
          total += Number(item.price);
        }         
      })
      return total;
    }
  },
  watch:{
    CostList:{
      handler(val){
        let data = {
          FXBX_DATA : {
            cost : val
          }
        }
        this.$emit('sel-data',data);

      },
      deep:true
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
        expSubject : [], //费用科目
        expSubjectList : [],//费用科目列表
        price :'', //报销金额
        reson : '', // 报销事由
      })
    },
    //删除费用明细
    deleteCost(){
      this.CostList.pop();
    },
    // TODO 选中费用
    selMatter(val) {
      let sels = val;
      this.CostList[this.costIndex].expSubjectList = [];
      this.CostList[this.costIndex].COST_NAME = sels.COST_NAME;
      this.CostList[this.costIndex].COST_CODE = sels.COST_CODE;
      this.CostList[this.costIndex].expSubject[0] = sels.COST_SUB_SUBJECTS.split(',')[0];
      this.CostList[this.costIndex].expSubjectList.push(sels.COST_SUB_SUBJECTS.split(','));
      this.CostList[this.costIndex].COST_TYPE = sels.COST_TYPE;
      console.log(this.CostList[this.costIndex].expSubjectList);
    },
    // TODO 选中项目
    selProject(val){
      console.log(val);
      this.project = {
        name : val.PROJECT_NAME,
        type : val.PROJECT_TYPE
      }
    },
    // TODO 提交
    submitOrder() {
      let warn = '';
      let dataSet = [];
      // if (!warn && !this.CostList.length) {
      //   warn = '请选择费用';
      // }
      this.CostList.every(item => {
        if(!item.COST_NAME){
          warn = '请选择费用名称';
          return false
        }
        if (!item.price) {
          warn = '请输入报销金额';
          return false
        }
        if(!item.reson){
          warn = '请输入报销事由'
          return false
        }
        dataSet.push({
          costName_expCode: item.COST_NAME, //费用名称
          expCode: item.COST_CODE, //费用编码
          expSubject: item.expSubject[0] , //费用科目
          costType_expCode: item.COST_TYPE || null, //费用类型
          tdAmount: item.price, //报销金额
          expCause : item.reson, // 报销事由
          comment : null
        });
        return true
      });
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
          let operation = submitAndCalc;
          let submitData = {
            listId: 'b61ef324-f261-48d6-9c79-d1b475c24943',
            biComment: '',
            formData: JSON.stringify({
              ...this.formData,
              creator: this.transCode ? this.formData.handler : '',
              modifer: this.transCode ? this.formData.handler : '',
              order: {
                dealerDebit: this.formData.handler,
                dealerCodeCredit : this.formData.userCode,
		            crDealerLabel: '员工',
                project : this.project.name,
                dataSet
              }
            }),
          };
          if (this.transCode) {
            operation = saveAndCommitTask
          }
          this.saveData(operation, submitData);
        }
      });
    },
    // TODO 获取详情
    getFormData() {
    },
  },
  created() {
    let data = sessionStorage.getItem('FXBX_DATA');
    if(data){
      this.CostList = JSON.parse(data).cost
    }
  }, 
}
</script>

<style lang="scss" scoped>
  @import '../scss/bizApply.scss';
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
