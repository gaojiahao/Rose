<template>
  <div class="pages xmjh-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <!-- 项目计划基本信息-->
        <pop-name-list @sel-item="selProject"></pop-name-list>

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
                        <x-input title="任务名称" v-model="item.taskName" text-align='right' placeholder='请填写'>
                          <template slot="label">
                            <span class='required'>任务名称
                            </span>
                          </template>
                        </x-input>
                        <popup-picker title="任务类型" :data="projectTypes" v-model="projectType[index]"
                                      @on-change=" typeTask($event,item) "></popup-picker>
                        <datetime title="截止日期" v-model='item.deadline'>
                          <template slot="title">
                            <span class='required'>截止日期
                            </span>
                          </template>
                        </datetime>
                        <x-input title="计划工时" type="number" v-model.number="item.planTime" text-align='right'
                                 placeholder='请填写' @on-blur="checkTime(item)"></x-input>
                        <x-textarea title="任务说明" v-model="item.comment" :max="200"></x-textarea>
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
          <div>您还需要添加新的计划? 请点击
            <span @click="addPlan">添加</span>
            <em v-if="projectPlan.length>1">或</em>
            <span @click="delatePlan" v-if="projectPlan.length>1"> 删除</span>
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
    XTextarea, Datetime, TransferDom,
    Picker, Popup, PopupRadio, PopupPicker
  } from 'vux'
  // 请求 引入
  import {saveProjectPlan} from 'service/projectService'
  // mixins 引入
  import ApplyCommon from './../mixins/applyCommon'
  // 组件引入
  import RPicker from 'components/RPicker'
  import PopNameList from 'components/Popup/PopNameList'
  // 方法引入
  import {toFixed} from '@/plugins/calc'

  export default {
    mixins: [ApplyCommon],
    components: {
      Icon, Cell, Group, XInput,
      RPicker, Datetime, XTextarea, TransferDom,
      Popup, Picker, PopupRadio, PopNameList, PopupPicker
    },
    data() {
      return {
        listId: '0281f8eb-f1d2-415c-b566-756fc749ccb3',
        projectTypes: [['设计类', '协调类', '执行类']],
        projectType: [],
        showDealerPop: false,
        planModel: {
          "taskName": "",//任务名称
          "taskType": "",//任务类型
          "comment": "",//备注
          "deadline": "",//截止日期
          "planTime": "",//计划工时
        },
        projectPlan: [],
        formData: {},
        FormDataComment: '',//备注
        projectName: '', // 项目名称
      }
    },
    methods: {
      //添加项目计划
      addPlan() {
        let planModel = JSON.stringify(this.planModel);
        this.projectPlan.push(JSON.parse(planModel));
        this.projectType.push([]);
      },
      //删除项目计划
      delatePlan() {
        this.projectPlan.pop();
        this.projectType.pop();
      },
      //任务类型选择
      typeTask(e, item) {
        item.taskType = e[0];
      },
      // TODO 选中项目计划项
      selProject(val) {
        let sel = JSON.parse(val);
        this.projectName = sel.PROJECT_NAME;
      },
      // TODO 提交
      save() {
        //验证选择项目
        if (!this.projectName) {
          this.$vux.alert.show({
            content: '请选择项目'
          });
          return;
        }
        let msgTask = '';
        let objArr = {
          taskName: '任务名称',
          taskType: '任务类型',
          comment: '任务说明',
          deadline: '截止日期',
          planTime: '计划工时',
        }
        //验证任务计划
        for (let i = 0; i < this.projectPlan.length; i++) {
          for (let j in this.projectPlan[i]) {
            if (this.projectPlan[i][j] == '') {
              let msgTitle = j === 'taskType' || j === 'deadline' ? '请选择' : '请填写';
              msgTask = msgTitle + objArr[j];
              this.$vux.alert.show({
                content: msgTask
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
                projectApproval: {
                  projectName: this.projectName
                },
                projectPlan: this.projectPlan
              },
            };
            this.saveData(operation, submitData);
          }
        });
      },
      // TODO 校验计划工时,保留一位小数
      checkTime(item) {
        console.log(item.planTime)
        if (item.planTime) {
          item.planTime = Math.abs(toFixed(item.planTime, 1));
        }
      },
    },
    created() {
      let plan = JSON.stringify(this.planModel);
      this.projectPlan.push(JSON.parse(plan));
      this.projectType.push([]);
    },
  }
</script>

<style lang="scss" scoped>
  @import './../scss/bizApply';
  .materiel_list .mater_list .each_mater {
    padding: unset;
  }
  .xmjh-apply-container {
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

  .vux-cell-box:not(:first-child):before {
    left: 0;
  }

  .XMJH_add {
    text-align: center;
    font-size: 0.12rem;
    padding: 0.1rem 0;
    color: #757575;
    span {
      color: #fff;
      padding: .01rem .04rem;
      border-radius: .12rem;
      &:nth-child(1) {
        background: #5077aa;
      }
      &:nth-child(3) {
        background: #fc3c3c;
      }
    }
    em {
      font-style: normal;
    }
  }

  .JH_mar_btm0 {
    margin-bottom: 0 !important;
  }
</style>
