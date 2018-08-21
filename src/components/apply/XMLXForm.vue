<template>
  <div class="pages xmrw-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">

        <!-- 项目经理-->
        <div class='r-picker vux-1px-b r-picker-3' @click='XMLXshowStatus'>
          <div class="title">项目经理</div>
          <div class="mode">{{managerName || placeholder}} {{managerValue}}</div>
          <x-icon class="r_arrow" type="ios-arrow-right" size="20" ></x-icon>
          <div v-transfer-dom>
            <popup id="trade_pop_part" v-model="XMLXshow">
              <div>
                <div class='popup_header vux-1px-b'>
                  <span class='cancel' @click="XMLXcancel">取消</span>
                  <span class='confirm' @click="XMLXconfirm(managerTask)">确认</span>
                </div>
                <picker :data="managerList" :columns="1"  v-model="managerTask"></picker>
              </div>
            </popup>
          </div>
        </div>
        
        <!-- 项目类型-->
        <r-picker title="项目类型" :data="projectTypes" mode="3" placeholder="请选择项目类型"
                  v-model="ProjectApproval.projectType"></r-picker>
                  
        <div class="xmlx_list">
            <!-- 商机列表 -->
            <div class="materiel_list mg_auto box_sd">
                <div class="mater_list">
                    <div class="each_mater">
                    <div class="each_mater_wrapper">
                        <div class="mater_main" style='max-width:100%;'>
                        <div class="userInp_mode">
                            <div class="title">项目立项明细</div>
                            <group class="SJ_group" @group-title-margin-top="0">
                                <x-input  title="项目名称" v-model="ProjectApproval.projectName" text-align='right'  placeholder='请填写'></x-input> 
                                <x-input  title="预算收入" v-model="ProjectApproval.budgetIncome" text-align='right'  placeholder='请填写' ref="budgetIncome" @input="filterNum($event,'budgetIncome')"></x-input>
                                <x-input  title="预算成本" v-model="ProjectApproval.budgetCapital" text-align='right'  placeholder='请填写' ref="budgetCapital" @input="filterNum($event,'budgetCapital')"></x-input>
                                <x-input  title="预算费用" v-model="ProjectApproval.budgetCost" text-align='right'  placeholder='请填写' ref="budgetCost" @input="filterNum($event,'budgetCost')"></x-input>
                                <datetime title="预算开始日期" v-model='ProjectApproval.expectStartDate'></datetime>
                                <datetime title="预算截至日期" v-model='ProjectApproval.expectEndDate'></datetime>
                                <x-textarea title="项目说明" v-model="ProjectApproval.comment" :max="200"></x-textarea>
                                <cell title="预算利润" :value="profit"></cell>
                                <cell title="预算利润率" :value="profitMargin"></cell>
                                <x-textarea title="备注" v-model="FormDataComment" :max="200"></x-textarea>
                            </group>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
  import {Icon, Cell, Group, XInput,XTextarea, Swipeout, SwipeoutItem, SwipeoutButton, Datetime, TransferDom, Picker, Popup,PopupRadio} from 'vux'
  import ApplyCommon from './../mixins/applyCommon'
  import RPicker from 'components/RPicker'
  import {saveProjectApproval} from 'service/projectService'

  export default {
    mixins: [ApplyCommon],
    components: {
      Icon,
      Cell,
      Group,
      XInput,
      Swipeout,
      SwipeoutItem,
      SwipeoutButton,
      RPicker,
      Datetime,
      XTextarea, 
      TransferDom, 
      Picker, 
      Popup,
      PopupRadio
    },
    data() {
      return {
        managerList:[
          {
            name:'马云',
            value:'132634679879',
            parent: '0'
          },{
            name:'马化腾',
            value:'123444897997',
            parent: '0'
          }],
        managerTask:[],
        managerName:'',
        managerValue:'',
        placeholder:'请选择',
        projectTypes:['单品','客制','展销','促销'],
        projectType:'',
        XMLXshow: false,
        projectList: [],
        ProjectApproval:{
          "projectName": "", //项目名称
          "projectType": "",//项目类型
          "projectManager": "",//项目经理
          "phoneNumber": "",//手机号
          "expectStartDate": this.getNowFormatDate(),//预期开始日期
          "expectEndDate": this.getNowFormatDate(),//预期截至日期
          "budgetIncome": "",//预算收入
          "budgetCapital": "",//预算成本
          "budgetCost": "",//预算费用
          "budgetProfit": '',//预算利润
          "budgetProfitMargin": '',//预算利润率
          "comment": ""//项目说明
        },
        FormDataComment:'',//备注
        formData: {},
        jsonData: {
          bomType: {
            bomType: ''
          },
          comment: {
            biComment: ''
          },
        },
      }
    },
    methods: {
      //picker显示
      XMLXshowStatus() {
        this.XMLXshow = !this.XMLXshow;
      },
      //picker确认
      XMLXconfirm(e){
        for(let i = 0 ; i<this.managerList.length; i++){
          if(this.managerList[i].value == e[0]){
            this.managerName = this.managerList[i].name;
            this.ProjectApproval.projectManager = this.managerList[i].name;
            this.ProjectApproval.phoneNumber = this.managerList[i].value;
          }
        }
        this.managerValue = e[0];
        this.XMLXshow = false;
      },
      //picker取消
      XMLXcancel(){
        this.XMLXshow = false;
      },
      //限制只能输入数字
      filterNum(e,ref){
        let num = e.replace(/[^\d]/g,'');
        this.$refs[ref].currentValue = num;
        this.ProjectApproval[ref] = num;
      },
      //获取今天时间
      getNowFormatDate() {
          let date = new Date();
          let seperator1 = "-";
          let month = date.getMonth() + 1;
          let strDate = date.getDate();
          if (month >= 1 && month <= 9) {
              month = "0" + month;
          }
          if (strDate >= 0 && strDate <= 9) {
              strDate = "0" + strDate;
          }
          let currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                  + " " ;
          return currentdate;
      },
      // TODO 提交
      save() {
        let msgTask='';
        let objArr = [
          {tip:'projectManager',msg:'项目经理'},
          {tip:'projectType',msg:'项目类型'},
          {tip:'projectName',msg:'项目名称'},
          {tip:'budgetIncome',msg:'预算收入'},
          {tip:'budgetCapital',msg:'预算成本'},
          {tip:'budgetCost',msg:'预算费用'},
          {tip:'expectStartDate',msg:'预期开始日期'},
          {tip:'expectEndDate',msg:'预期截至日期'},
          {tip:'comment',msg:'项目说明'},
        ];
        for(let i = 0 ; i<objArr.length;i++){
          if(this.ProjectApproval[objArr[i].tip] == ''){
            let msgTitle = objArr[i].tip == 'projectManager' || objArr[i].tip == 'projectType' || objArr[i].tip == 'expectStartDate' || objArr[i].tip == 'expectEndDate'?'请选择':'请填写';
             msgTask = msgTitle + objArr[i].msg
             this.$vux.alert.show({
                content:msgTask
              })
            return;
          }
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            let operation = saveProjectApproval;
            let submitData = {
              listId: '630a9b96-f257-48b6-b0bc-fd64c455d92b',
              formData: {
                comment:{
                  biComment: this.FormDataComment,
                },
                baseinfo: {
                    creator: this.formData.handler,
                    handler: this.formData.handler,
                    handlerName: this.formData.handlerName ,
                    handlerRole: this.formData.handlerRole,
                    handlerRoleName: this.formData.handlerRoleName,
                    handlerUnit:  this.formData.handlerUnit,
                    handlerUnitName: this.formData.handlerUnitName,
                    id: '',
                    modifer: this.formData.handler,
                },
                projectApproval:this.ProjectApproval
              },
              wfParam:null
            };
            this.saveData(operation, submitData);
          }
        });
      }
    },
    created() {
    },
    computed:{
      //利润
      profit(){
        let ProjectApproval = this.ProjectApproval;
        let budgetIncome = ProjectApproval.budgetIncome == ''?0:ProjectApproval.budgetIncome;
        let budgetCapital = ProjectApproval.budgetCapital == ''?0:ProjectApproval.budgetCapital;
        let budgetCost = ProjectApproval.budgetCost == ''?0:ProjectApproval.budgetCost;
        ProjectApproval.budgetProfit = budgetIncome-budgetCapital-budgetCost;
        return budgetIncome-budgetCapital-budgetCost;
      },
      //利润率
      profitMargin(){
        let ProjectApproval = this.ProjectApproval;
        let budgetIncome = ProjectApproval.budgetIncome == ''?0:ProjectApproval.budgetIncome;
        let budgetCapital = ProjectApproval.budgetCapital == ''?0:ProjectApproval.budgetCapital;
        let budgetCost =  ProjectApproval.budgetCost == ''?0:ProjectApproval.budgetCost;
        let subCost = budgetIncome-budgetCost;
        let profitMarginVal = 0;
        if(budgetCapital!=0&&budgetIncome!=0){
          profitMarginVal = (budgetCapital/subCost).toFixed(2)
        }
        ProjectApproval.budgetProfitMargin = profitMarginVal;
        return profitMarginVal;
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import './../scss/bizApply';

  .xmrw-apply-container {
    .or_ads {
      padding: .06rem .08rem;
    }
    /deep/ .weui-cells {
      margin-top: 0;
      font-size: .16rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 10px 0;
        &:before {
          left: 0;
        }
      }
    }
  }
  .materiel_list{
      padding: 0;
  }
  .xmlx_list .materiel_list .mater_list .each_mater_wrapper .mater_main{
      width: 100%;
      max-width: inherit!important;
      margin-left: 0;
  }
  .materiel_list .mater_list .each_mater_wrapper .mater_main{
    margin-left: 0;
  }
</style>
<style scoped lang="scss">
  .r-picker {
    padding: 0.05rem 0.08rem;
    font-size: 0.16rem;
    &.r-picker-2 {
      > label {
        display: none;
      }
      .picker {
        padding-right: .1rem;
      }
      .horizontal-title {
        display: block;
      }
      .r_arrow {
        position: absolute;
        right: -.04rem;
      }
    }
    /* 模式3样式 */
    &.r-picker-3 {
      position: relative;
      margin: 10px auto;
      padding: .06rem .08rem;
      width: 95%;
      box-sizing: border-box;
      box-shadow: 0 0 8px #e8e8e8;
      .title {
        color: #757575;
        font-weight: 200;
        font-size: .12rem;
      }
      .mode {
        color: #111;
        font-weight: 500;
      }
      .r_arrow {
        top: 50%;
        right: .04rem;
        position: absolute;
        transform: translate(0, -50%);
      }
    }
    label {
      color: #6d6d6d;
      font-size: 0.12rem;
      display: block;
      line-height: 0.2rem;
    }
    .horizontal-title {
      display: none;
    }
    .required {
      color: red;
      font-weight: bold;
    }
    .picker {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: .38rem;
      .mater_nature {
        line-height: 0.2rem;
      }
      .iconfont {
        font-size: 0.24rem;
      }
      .r_arrow {
        display: inline-block;
        height: .38rem;
      }
    }
  }

  //确认框
  .popup_header {
    display: flex;
    justify-content: space-between;
    height: 44px;
    line-height: 44px;
    font-size: 16px;
    background-color: #fbf9fe;
    padding: 0 15px;
    .cancel {
      color: #828282;
    }
    .confirm {
      color: #FF9900;
    }
  }

  .iconfont_fff {
    color: #fff;
  }
</style>
