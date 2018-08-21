<template>
  <div class="pages xmrw-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <!-- 项目计划基本信息-->
        <div class="or_ads mg_auto box_sd" @click="showDealerPop = !showDealerPop">
          <div class="no-selected" v-if="!dealerInfo">
            <div class="title">项目计划</div>
            <div class="mode">请选择项目</div>
            <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
          </div>
          <div v-else>
            <div class="user_info">
              <span class="user_name">{{dealerInfo.PROJECT_NAME}}</span>
              <span class="user_tel">{{dealerInfo.PROJECT_MANAGER}}</span>
            </div>
            <div class="cp_info">
              <p class="cp_name">{{dealerInfo.COMMENT}}</p>
              <p class="cp_ads">预期开始日期：{{dealerInfo.EXPECT_START_DATE}}</p>
              <p class="cp_ads">预期截止日期：{{dealerInfo.EXPECT_END_DATE}}</p>
            </div>
            <x-icon class="r_arrow" type="ios-arrow-right" size="30"></x-icon>
          </div>
        </div>
                  
        <div class="xmlx_list">
            <!-- 任务计划列表 -->
            <div class="materiel_list mg_auto box_sd" v-for="(item,index) in projectPlan" :key="index">
                <div class="mater_list">
                    <div class="each_mater JH_mar_btm0">
                    <div class="each_mater_wrapper">
                        <div class="mater_main" style='max-width:100%;'>
                        <div class="userInp_mode">
                            <div class="title">任务计划</div>
                            <group class="SJ_group" @group-title-margin-top="0">
                                <x-input  title="任务名称" v-model="item.taskName" text-align='right'  placeholder='请填写'></x-input>
                                <popup-picker title="任务类型" :data="projectTypes" v-model="projectType[index]" @on-change=" typeTask($event,item) "></popup-picker>
                                <x-textarea title="任务说明" v-model="item.comment" :max="200"></x-textarea> 
                                <datetime title="截止日期" v-model='item.deadline'></datetime>
                                <x-input  title="计划工时" v-model="item.planTime" text-align='right'  placeholder='请填写' :ref="'planTime'+index" @input="filterNum($event,'planTime',index)"></x-input>
                            </group>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 新增 -->
        <div class="XMJH_add">
          <div>您还需要添加新的计划?请点击<span @click="addPlan">添加</span><span @click="delatePlan" v-if="projectPlan.length>1">删除</span></div>
        </div>

        <!-- 备注 -->
        <div class="materiel_list mg_auto box_sd">
            <div class="mater_list">
                <div class="each_mater">
                <div>
                    <div class="mater_main">
                    <div class="userInp_mode">
                        <group class="SJ_group" @group-title-margin-top="0">
                            <x-textarea title="备注" v-model="FormDataComment"  :max="200"></x-textarea> 
                        </group>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
            
        <!-- 项目计划popup -->
          <pop-name-list :show="showDealerPop" v-model="showDealerPop"
                          @sel-dealer="selDealer" @closePop='showDealerPop = !showDealerPop'
                          ref="dealer"></pop-name-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
// vux组件引入
import { 
Icon, Cell, Group, XInput, 
XTextarea, Datetime, TransferDom, 
Picker, Popup,PopupRadio,PopupPicker } from 'vux'
// 请求 引入
import { getProjectApproval, saveProjectPlan } from 'service/projectService'
// mixins 引入
import ApplyCommon from './../mixins/applyCommon'
// 组件引入
import RPicker from 'components/RPicker'
import PopNameList from 'components/Popup/PopNameList'

export default {
  mixins: [ApplyCommon],
  components: {
    Icon, Cell, Group, XInput,
    RPicker, Datetime, XTextarea, TransferDom, 
    Popup, Picker, PopupRadio, PopNameList, PopupPicker
  },
  data() {
    return {
      projectTypes:[['设计类','协调类','执行类']],
      projectType:[],
      projectList: [],
      showDealerPop:false,
      dealerInfo:null,
      planModel:{
        "taskName": "",//任务名称
        "taskType": "",//任务类型
        "comment": "",//备注
        "deadline": "",//截止日期
        "planTime": "",//计划工时
      },
      projectPlan: [],
      formData: {},
      FormDataComment:'',//备注
    }
  },
  methods: {
    //添加项目计划
    addPlan(){
      let planModel = JSON.stringify(this.planModel);
      this.projectPlan.push(JSON.parse(planModel));
      this.projectType.push([]);
    },
    //删除项目计划
    delatePlan(){
      this.projectPlan.pop();
      this.projectType.pop();
    },
    //任务类型选择
    typeTask(e,item){
      item.taskType = e[0];
    },
    // TODO 选中项目计划项
    selDealer(val) {
      let [sels] = JSON.parse(val);
      this.dealerInfo = sels;
    },
    //限制只能输入数字
    filterNum(e,ref,idx){
      let num = e.replace(/[^\d]/g,'');
      this.$refs[ref+idx][0].currentValue = num;
      this.projectPlan[idx].planTime = num;
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
      //验证选择项目
      if(!this.dealerInfo){
          this.$vux.alert.show({
              content:'请选择项目'
            })
          return;
      }
      let msgTask='';
      let objArr = {
        taskName:'任务名称',
        taskType:'任务类型',
        comment:'任务说明',
        deadline:'截止日期',
        planTime:'计划工时',
      }
      //验证任务计划
      for(let i = 0 ; i<this.projectPlan.length ; i++){
        for(let j in this.projectPlan[i]){
          if(this.projectPlan[i][j] == ''){
            let msgTitle = j == 'taskType'|| j == 'deadline'?'请选择':'请填写';
            msgTask= msgTitle + objArr[j];
            this.$vux.alert.show({
                content:msgTask
              })
            return;
          }
        }
      }
      this.$vux.confirm.show({
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          let operation = saveProjectPlan;
          let submitData = {
            listId: "0281f8eb-f1d2-415c-b566-756fc749ccb3",
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
              projectApproval:{
                projectName:this.dealerInfo.PROJECT_NAME
              },
              projectPlan:this.projectPlan
            },
            wfParam:null
          };
          this.saveData(operation, submitData);
        }
      });
    },
    // TODO 请求项目列表
    getProjectList() {
      return getProjectApproval().then(({tableContent = []}) => {
        let tmp = [];
        tableContent.forEach(item => {
          tmp.push(item);
        });
        this.projectList = tmp;
      })
    },
  },
  created() {
      let plan = JSON.stringify(this.planModel);
      this.projectPlan.push(JSON.parse(plan));
      this.projectType.push([]);
      this.getProjectList();
  },
  computed:{
    
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
  .cp_info{
    p{
      margin-right: 30px;
    }
  }
  .vux-cell-box:not(:first-child):before{
    left: 0;
  }
  .XMJH_add{
    text-align: center;
    font-size: 0.12rem;
    padding: 0.1rem 0;
    color: #757575;
    span{
      margin-left: 5px;
      &:nth-child(1){
        color: #5077aa;
      }
      &:nth-child(2){
        color: #fc3c3c;
      }
    }
  }
  .JH_mar_btm0{
    margin-bottom: 0!important;
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
