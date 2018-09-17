<template>
  <div class="pages xmrw-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-manager-list @sel-item="selManager" :defaultValue="defaultManager"></pop-manager-list>
        <!-- 项目类型-->
        <r-picker title="项目大类" :data="typeList" mode="3" placeholder="请选择项目大类"
                  @on-change="projectBigChange"
                  v-model="ProjectApproval.projectType" :required="ProjectApproval.projectType === ''"></r-picker>
        <r-picker title="项目子类" :data="subclassList" mode="3" placeholder="请选择项目子类"
                  v-model="ProjectApproval.projectSubclass"></r-picker>
        <div class="xmlx_list">
          <!-- 项目立项明细 -->
          <div class="materiel_list mg_auto box_sd">
            <div class="mater_list">
              <div class="each_mater">
                <div class="each_mater_wrapper">
                  <div class="mater_main" style='max-width:100%;'>
                    <div class="userInp_mode">
                      <div class="title">项目立项明细</div>
                      <group class="SJ_group" @group-title-margin-top="0">
                        <x-input title="项目名称" v-model="ProjectApproval.projectName" text-align='right'
                                 placeholder='请填写'>
                          <template slot="label">
                            <span class='required'>项目名称
                            </span>
                          </template>
                        </x-input>
                        <x-input title="预算收入" type="number" v-model.number="ProjectApproval.budgetIncome"
                                 text-align='right' placeholder='请填写'
                                 @on-blur="checkAmt('budgetIncome', $event)">
                          <template slot="label">
                            <span class='required'>预算收入
                            </span>
                          </template>
                        </x-input>
                        <x-input title="预算成本" type="number" v-model.number="ProjectApproval.budgetCapital"
                                 text-align='right' placeholder='请填写'
                                 @on-blur="checkAmt('budgetCapital', $event)">
                          <template slot="label">
                            <span class='required'>预算成本
                            </span>
                          </template>
                        </x-input>
                        <x-input title="预算费用" type="number" v-model.number="ProjectApproval.budgetCost"
                                 text-align='right' placeholder='请填写'
                                 @on-blur="checkAmt('budgetCost', $event)">
                          <template slot="label">
                            <span class='required'>预算费用
                            </span>
                          </template>
                        </x-input>
                        <datetime title="预期开始日期" v-model='ProjectApproval.expectStartDate'>
                          <template slot="title">
                            <span class='required'>预期开始日期
                            </span>
                          </template>
                        </datetime>
                        <datetime title="预期截止日期" v-model='ProjectApproval.expectEndDate'>
                          <template slot="title">
                            <span class='required'>预期截止日期
                            </span>
                          </template>
                        </datetime>
                        <cell title="预算利润" :value="profit"></cell>
                        <cell title="预算利润率" :value="profitMargin"></cell>
                        <x-textarea title="项目说明" v-model="ProjectApproval.comment" :max="200"></x-textarea>
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
  // vux组件引入
  import {
    Icon, Cell, Group, XInput,
    XTextarea, Swipeout, SwipeoutItem, SwipeoutButton,
    Datetime, TransferDom, Picker, Popup, PopupRadio, dateFormat
  } from 'vux'
  // 请求 引入
  import {saveProjectApproval, findProjectApproval} from 'service/projectService'
  import {getDictByType, getDictByValue} from 'service/commonService'
  // mixins 引入
  import ApplyCommon from './../mixins/applyCommon'
  // 组件 引入
  import RPicker from 'components/RPicker'
  import PopManagerList from 'components/Popup/PopManagerList'

  export default {
    mixins: [ApplyCommon],
    components: {
      Icon, Cell, Group, XInput,
      Swipeout, SwipeoutItem, SwipeoutButton, RPicker,
      Datetime, XTextarea, TransferDom,
      Picker, Popup, PopupRadio, PopManagerList,
    },
    data() {
      return {
        listId: '630a9b96-f257-48b6-b0bc-fd64c455d92b',
        typeList: [], // 项目大类列表
        subclassList: [], // 项目子类列表
        ProjectApproval: {
          projectName: '', //项目名称
          projectType: '',//项目类型
          projectManager: '',//项目经理
          phoneNumber: '',//手机号
          expectStartDate: dateFormat(new Date, 'YYYY-MM-DD'),//预期开始日期
          expectEndDate: dateFormat(new Date, 'YYYY-MM-DD'),//预期截止日期
          budgetIncome: '',//预算收入
          budgetCapital: '',//预算成本
          budgetCost: '',//预算费用
          budgetProfit: '',//预算利润
          budgetProfitMargin: '',//预算利润率
          comment: '', //项目说明
          projectSubclass: '', // 项目子类
        },
        FormDataComment: '',//备注
        formData: {},
        jsonData: {
          comment: {
            biComment: ''
          },
        },
        defaultManager: {},
      }
    },
    computed: {
      //利润
      profit() {
        let {budgetIncome = 0, budgetCapital = 0, budgetCost = 0} = this.ProjectApproval;
        let budgetProfit = Number(budgetIncome) - Number(budgetCapital) - Number(budgetCost);
        this.ProjectApproval.budgetProfit = budgetProfit;
        return budgetProfit;
      },
      //利润率
      profitMargin() {
        let {budgetIncome = 0, budgetProfit = 1} = this.ProjectApproval;
        let budgetProfitMargin = Math.floor(Number(budgetProfit) / (Number(budgetIncome) || 1) * 10000) / 10000;
        this.ProjectApproval.budgetProfitMargin = budgetProfitMargin;
        return `${budgetProfitMargin * 10000 / 100}%`;
      }
    },
    methods: {
      // TODO 提交
      save() {
        let objArr = [
          {tip: 'projectManager', msg: '项目经理'},
          {tip: 'projectType', msg: '项目大类'},
          {tip: 'projectName', msg: '项目名称'},
          {tip: 'budgetIncome', msg: '预算收入'},
          {tip: 'budgetCapital', msg: '预算成本'},
          {tip: 'budgetCost', msg: '预算费用'},
          {tip: 'expectStartDate', msg: '预期开始日期'},
          {tip: 'expectEndDate', msg: '预期截止日期'},
        ];
        let selArr = ['projectManager', 'projectType'];
        let warn = '';
        objArr.every(item => {
          if (!this.ProjectApproval[item.tip]) {
            if (selArr.includes(item.tip)) {
              warn = `请选择${item.msg}`;
            } else {
              warn = `请填写${item.msg}`;
            }
            return false
          }
          return true
        });
        if (warn) {
          this.$vux.alert.show({
            content: warn
          });
          return
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let operation = saveProjectApproval;
            let submitData = {
              listId: this.listId,
              formData: {
                handlerEntity: this.entity.dealerName,
                comment: {
                  biComment: this.FormDataComment,
                },
                baseinfo: {
                  creator: this.formData.handler,
                  handler: this.formData.handler,
                  handlerName: this.formData.handlerName,
                  handlerRole: this.formData.handlerRole,
                  handlerRoleName: this.formData.handlerRoleName,
                  handlerUnit: this.formData.handlerUnit,
                  handlerUnitName: this.formData.handlerUnitName,
                  id: '',
                  modifer: this.formData.handler,
                },
                projectApproval: this.ProjectApproval
              },
              wfParam: null
            };
            this.saveData(operation, submitData);
          }
        });
      },
      // TODO 选中项目经理
      selManager(val) {
        let sel = JSON.parse(val);
        this.ProjectApproval.projectManager = sel.dealerName;
        this.ProjectApproval.phoneNumber = sel.dealerMobilePhone;
      },
      // TODO 检查金额
      checkAmt(key = '', val) {
        if (val) {
          this.ProjectApproval[key] = Math.abs(parseInt(val));
        }
      },
      // TODO 获取项目大类
      getBigType() {
        return getDictByType('projectType').then(({tableContent = []}) => {
          tableContent && tableContent.forEach(item => {
            item.originValue = item.value;
            item.value = item.name;
          });
          this.typeList = tableContent;
        });
      },
      // TODO 获取项目子类
      getType() {
        let selected = this.typeList.find(item => {
          return item.name === this.ProjectApproval.projectType
        }) || {};
        return getDictByValue(selected.originValue).then(({tableContent = []}) => {
          tableContent && tableContent.forEach(item => {
            item.originValue = item.value;
            item.value = item.name;
          });
          this.subclassList = tableContent;
          // 没有值则默认取第一个
          if (!this.ProjectApproval.projectSubclass) {
            let [defaultSelect = {}] = tableContent;
            this.ProjectApproval.projectSubclass = defaultSelect.name;
          }
        });
      },
      // TODO 项目大类切换
      projectBigChange(val) {
        this.ProjectApproval.projectSubclass = '';
        this.getType()
      },
      // TODO 获取显示数据
      getFormData() {
        return findProjectApproval(this.transCode).then(({formData = {}}) => {
          this.defaultManager = {
            dealerName: formData.approval.projectManager,
            dealerMobilePhone: formData.approval.phoneNumber,
          };
          this.ProjectApproval = formData.approval;
          this.formData = formData.baseinfo;
        })
      },
      // TODO 初始化页面的数据
      initRequest() {
        let promises = [];
        promises.push(this.getBigType());
        return Promise.all(promises);
      }
    },
    created() {
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

  .xmlx_list .materiel_list .mater_list .each_mater_wrapper .mater_main {
    width: 100%;
    max-width: inherit !important;
    margin-left: 0;
  }

  .materiel_list .mater_list .each_mater_wrapper .mater_main {
    margin-left: 0;
  }
</style>
<style scoped lang="scss">
  .materiel_list .mater_list .each_mater {
    padding: unset;
  }

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
      color: #5077aa;
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
