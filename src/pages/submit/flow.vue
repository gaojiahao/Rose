<template>
  <div class="pages flow-container">
    <h1 class="f_title">
      确定工作流
    </h1>
    <div class="f_main">
      <div class="f_main_wrapper">
        <group title="请填写对应的信息" class="info-container">
          <popup-radio :title="item.title" :options="item.options" v-for="(item, index) in opList" v-model="item.value"
                       :key="index"></popup-radio>
          <cell title="财务" value="辛艳"></cell>
          <cell title="总裁" value="王珏"></cell>
        </group>
        <group class="search-list-container" v-show="!hasSelected" :style="{top: searchListTop}">
          <cell :title="item.name" v-for="(item, index) in searchList" :key="index"
                @click.native="searchItemClick(item)" @touchmove.stop=""></cell>
        </group>
        <div class="f_flow">
          <group title="流程图"></group>
          <flow orientation="vertical" style="height:300px;float:left;padding:10px 20px">
            <flow-state state="1" :title="handlerData.nickname" is-done></flow-state>
            <flow-line tip="进行中" tip-direction='right'></flow-line>
            <flow-state state="2" :title="handlerData.area === '总部' ?  '部门主管' : '常委'"></flow-state>
            <flow-line></flow-line>
            <flow-state state="3" title="副总"></flow-state>
            <flow-line></flow-line>
            <flow-state state="4" title="财务"></flow-state>
            <flow-line :line-span="30"></flow-line>
            <flow-state state="5" title="总裁——王珏"></flow-state>
          </flow>
        </div>
      </div>
    </div>
    <div class="f_button" @click="submitData">确定</div>
    <loading :show="showLoading"></loading>
  </div>
</template>

<script>
  import {Flow, Cell, Group, XInput, FlowState, FlowLine, PopupRadio,} from "vux";
  import createService from './../../service/createService'
  import common from './../mixins/common'

  const USER_INFO = 'RFD_CURRENT_USER_INFO';
  export default {
    components: {
      Flow,
      Cell,
      Group,
      XInput,
      FlowLine,
      FlowState,
      PopupRadio,
    },
    data() {
      return {
        showLoading: false,
        searchList: [], // 搜索结果列表
        searchType: '', // 当前聚焦的输入框类型
        hasSelected: false, // 是否选中搜索项
        formData: {}, // 表单数据
        procCode: '', // 表单编码
        searchListTop: 0, // 匹配列表距离顶部的距离
        sessionKey: '', // 存储formData的key
        taskId: '', // 任务id，修改时会有
        jsonData: {},
        currentUser: {}, // 当前用户信息
        opList: [], // 审批人列表
        handlerData: {},
        submitSuccess: false,
      };
    },
    mixins: [common],
    methods: {
      // TODO 获取节点
      getProcess() {
        return createService.getProcess({
          listId: this.listid
        }).then(data => {
          this.procCode = data[0] && data[0].procCode || '';
        }).catch(e => {
          this.showToast(e.message);
        });
      },
      // TODO 提交数据
      submitData() {
        let transCode = this.jsonData.baseinfo.transCode;
        let warn = '';
        let submitData = {
          transCode,
        };
        let wfPara = {};
        let submitMethod = 'saveAndStartWfOld';
        let area = this.handlerData.area;
        // 校验数据
        this.opList.every(item => {
          if (!item.value) {
            warn = `${item.name}不能为空`;
            return false
          }
          return true
        });
        if (warn) {
          this.showToast(warn);
          return
        }
        let opParams = this.getOpParams(area);
        this.jsonData = {
          ...this.jsonData,
          ...opParams.reviewer,
        };

        wfPara = {
          [this.procCode]: {
            'businessKey': transCode,
            'createdBy': '',
            '所属区域': area,
            ...opParams.wfPara,
          }
        };
        // 判断是否为重新提交
        if (this.taskId) {
          wfPara = {
            taskId: this.taskId,
            businessKey: transCode,
            createdBy: this.jsonData.baseinfo.creator,
            '所属区域': area,
            ...opParams.wfPara,
            transCode,
            result: 3,
            comment: ''
          };
          submitMethod = 'saveAndCommitTaskOld';
        }
        Object.assign(submitData, {
          jsonData: JSON.stringify(this.jsonData),
          wfPara: JSON.stringify(wfPara),
        });
        console.log(submitData)
        this.showLoading = true;
        createService[submitMethod](submitData).then(data => {
          this.showLoading = false;
          let {message, success} = data;
          if (success && message.indexOf('null') === -1) {
            this.submitSuccess = true;
            this.showToast('提交成功');
            sessionStorage.removeItem(this.sessionKey);
            setTimeout(() => {
              this.$router.go(-2);
            }, 1200)
          } else {
            this.showToast('提交失败');
          }
        }).catch(e => {
          this.showToast(e.message);
        })
      },
      // TODO 组装下拉框数据
      assembleData(id, value = '') {
        return {
          text: value,
          selection: {
            data: {
              id: '',
              userGroupId: Number(id),
              userGroupName: value,
            }
          },
          value
        }
      },
      // TODO 组装审批者数据
      assembleOpData(data = {}, text = '', value = '') {
        return {
          text,
          value,
          selection: {
            data
          }
        }
      },
      // TODO 初始化基本信息
      getBaseInfo() {
        let handleBaseInfo = async (data = {}) => {
          let {nickname = '', userId = '', area = '', areaID = '', groupName = '', groupNameID = '', position = '', roleID = ''} = data;
          // nickname = '耿延聪'; // 测试
          // nickname = '徐子庆'; // 测试
          area = area.split(',')[0];
          areaID = areaID.split(',')[0];
          groupName = groupName.split(',')[0];
          groupNameID = groupNameID.split(',')[0];
          position = position.split(',')[0];
          roleID = roleID.split(',')[0];
          this.currentUser = data;
          return createService.getCurrentUser(nickname).then(({tableContent = []}) => {
            let [handlerData = {}] = tableContent;

            this.jsonData.baseinfo = {
              ...this.jsonData.baseinfo,
              creatorName: nickname,
              creator: '',
              modifer: '',
              handler: userId,
              handlerArea: areaID,
              handlerUnit: groupNameID,
              handlerRole: roleID,
              handlerName: {
                text: nickname,
                value: nickname,
                selection: {
                  data: {
                    id: '',
                    ...handlerData
                  }
                }
              },
              handlerAreaName: this.assembleData(areaID, area),
              handlerUnitName: this.assembleData(groupNameID, groupName),
              handlerRoleName: this.assembleData(roleID, position),
            };
            this.handlerData = handlerData;
          });
        };

        /*let currentUser = sessionStorage.getItem(USER_INFO);
        if (currentUser) {
          currentUser = JSON.parse(currentUser);
          handleBaseInfo(currentUser);
          return Promise.resolve();
        }*/

        return createService.getBaseInfoData().then(handleBaseInfo);
      },
      // TODO 还原常委、副总裁
      restoreOpList() {
        let review = {...this.jsonData.$review};
        let review2 = {...this.jsonData.$review2};
        let val = '';
        let val2 = '';
        console.log(review)
        switch (this.handlerData.area) {
          case '总部':
            val = review.reviewer.text; // 部门主管
            val2 = review.deputy.text; // 副总
            break;
          default:
            val = review2.deputy.text; // 常委
            val2 = review2.fzc.text; // 副总
            break;
        }
        this.opHandler(val, val2);
      },
      // TODO 处理部门主管、常委、副总的展示
      opHandler(val, val2) {
        let {area} = this.handlerData;
        switch (area) {
          // 总部展示部门主管和分管总裁
          case '总部':
            this.headquartersHandler(val, val2);
            break;
          default:
            this.handlerBusiness(val, val2);
            break;
        }
      },
      // TODO 处理总部展示数据
      headquartersHandler(val = '', val2 = '') {
        let {userId, area, role} = this.handlerData;
        let promises = [];
        this.opList = [
          {
            title: '部门主管',
            options: [],
            key: '0',
            value: '',
          }, {
            title: '副总裁',
            options: [],
            key: '1',
            value: '',
          },
        ];
        // 获取部门主管
        promises.push(createService.getApprovalUserByAgent({
          userId: userId,
          group: area,
          grouRole: role,
        }));
        // 获取副总裁
        promises.push(createService.getApprovalUserByAgent({
          userId: userId,
          group: area,
          grouRole: '副总裁',
        }));
        Promise.all(promises).then(([data, data2]) => {
          let dept = [];
          let vicePresident = [];
          data.tableContent && data.tableContent.forEach(item => {
            dept.push(item.CName);
          });
          data2.tableContent && data2.tableContent.forEach(item => {
            vicePresident.push(item.comName);
          });
          this.opList[0].options = dept;
          this.opList[0].value = val || dept[0];
          this.opList[0].datas = data.tableContent;

          this.opList[1].options = vicePresident;
          this.opList[1].value = val2 || vicePresident[0];
          this.opList[1].datas = data2.tableContent;
        })
      },
      // TODO 处理事业部展示数据
      handlerBusiness(val = '', val2 = '') {
        let {userId, area, role} = this.handlerData;
        let promises = [];
        this.opList = [
          {
            title: '常委',
            options: [],
            key: '0',
            value: '',
          }, {
            title: '副总裁',
            options: [],
            key: '1',
            value: '',
          },
        ];
        let groupId = this.jsonData.baseinfo.handlerAreaName.selection.data.userGroupId;
        // 获取常委
        promises.push(createService.getApprovalUserByAgent({
          userId: userId,
          group: area,
          grouRole: '常委',
        }));
        // 获取副总裁
        promises.push(createService.getGroupPrinicalInfo({
          groupId
        }));
        Promise.all(promises).then(([data, data2]) => {
          let committee = [];
          let vicePresident = [];
          data.tableContent && data.tableContent.forEach(item => {
            committee.push(item.CName);
          });
          data2.tableContent && data2.tableContent.forEach(item => {
            vicePresident.push(item.NICKNAME);
          });
          this.opList[0].options = committee;
          this.opList[0].value = val || committee[0];
          this.opList[0].datas = data.tableContent;

          this.opList[1].options = vicePresident;
          this.opList[1].value = val2 || vicePresident[0];
          this.opList[1].datas = data2.tableContent;
        })
      },
      // TODO 获取审批者参数
      getOpParams(area) {
        let idObj = {
          reviewer: {},
          wfPara: {}
        };
        let [first = {}, second = {}] = [...this.opList];

        switch (area) {
          case '总部':
            let dept = {};
            let vicePresident = {};
            first.datas.forEach(item => {
              if (item.CName === first.value) {
                dept = {...item};
              }
            });
            second.datas.forEach(item => {
              if (item.comName === second.value) {
                vicePresident = {...item};
              }
            });
            idObj = {
              reviewer: {
                $review: {
                  reviewer: this.assembleOpData(dept, dept.CName, dept.CId),
                  deputy: this.assembleOpData(vicePresident, vicePresident.comName, vicePresident.comId),
                },
                $review2: {
                  reviewer: this.assembleOpData({}),
                  deputy: this.assembleOpData({}),
                  fzc: this.assembleOpData({}),
                  '$r2Textfield-1206-inputEl': ''
                }
              },
              wfPara: {
                '部门主管ID': dept.CId,
                '分管副总ID': vicePresident.comId,
                '省长ID': null,
                '常委ID': null,
                '副总裁ID': null
              }
            };
            break;
          // 事业部提交参数
          default:
            let committee = {};
            let vicePresident2 = {};
            first.datas.forEach(item => {
              if (item.CName === first.value) {
                committee = {...item};
              }
            });
            second.datas.forEach(item => {
              if (item.NICKNAME === second.value) {
                vicePresident2 = {...item};
              }
            });
            idObj = {
              reviewer: {
                $review: {
                  reviewer: this.assembleOpData(committee, committee.CName, committee.CId),
                  deputy: this.assembleOpData({}),
                },
                $review2: {
                  reviewer: this.assembleOpData({}),
                  deputy: this.assembleOpData(committee, committee.CName, committee.CId),
                  fzc: this.assembleOpData(vicePresident2, vicePresident2.NICKNAME, vicePresident2.PRINCIPAL),
                  '$r2Textfield-1206-inputEl': this.jsonData.baseinfo.handlerAreaName.selection.data.userGroupId
                }
              },
              wfPara: {
                '部门主管ID': null,
                '分管副总ID': null,
                '省长ID': null,
                '常委ID': committee.CId,
                '副总裁ID': vicePresident2.PRINCIPAL
              }
            };
            break;
        }
        return idObj;
      }
    },
    beforeRouteLeave(to, from, next) {
      if (this.submitSuccess && to.name === 'Mylist') {
        to.meta.reload = true;
      }
      next();
    },
    created() {
      let {query} = this.$route;
      this.listid = query.list;
      this.taskId = query.taskId;
      this.sessionKey = `${this.listid}-FORMDATA`;
      // let promises = [];
      let now = this.changeDate(new Date(), true);
      let jsonData = JSON.parse(sessionStorage.getItem(this.sessionKey) || "{}");
      this.jsonData = jsonData;
      this.formData = Object.assign({}, jsonData);
      // 修改时有创建时间，使用原来的创建时间
      this.jsonData.baseinfo.crtTime = jsonData.baseinfo.crtTime ? this.changeDate(jsonData.baseinfo.crtTime, true) : now;
      this.jsonData.baseinfo.modTime = now;
      if (this.taskId) {
        this.hasSelected = true;
        this.handlerData = {...this.jsonData.baseinfo.handlerName.selection.data};
        this.restoreOpList();
        return
      }
      this.showLoading = true;
      this.getProcess();
      this.getBaseInfo().then(data => {
        this.showLoading = false;
        this.opHandler();
      });
    }
  }
  ;
</script>

<style lang='scss'>
  .search-list-container {
    position: absolute;
    right: 0;
    z-index: 100;
    width: 50%;
    max-height: 300px;
    color: #000;
    box-shadow: 0 2px 10px #e8e8e8;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    .weui-cells {
      margin-top: 0;
    }
    .weui-cell {
      background-color: #fff;
      text-align: right;
    }
  }

  .f_title {
    //标题
    width: 100%;
    height: 80px;
    line-height: 80px;
    font-size: 34px;
    text-align: center;
    color: #fff;
    font-weight: 200;
    background: #5077aa;
    position: relative;
    .s_user {
      line-height: initial;
      font-size: 16px;
      font-weight: normal;
      position: absolute;
      left: 50%;
      bottom: 20%;
      transform: translate(-50%);
      display: flex;
      align-items: center;
      .right_arrow {
        fill: #fff;
      }
    }
  }

  .f_main {
    width: 90%;
    max-width: 600px;
    position: absolute;
    top: 70px;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 100;
    padding-bottom: 56px;
    .f_main_wrapper {
      height: 100%;
      border-radius: 4px;
      background: #fff;
      box-shadow: 0 2px 10px #e8e8e8;
      overflow: hidden;
    }
  }

  .f_button {
    width: 100%;
    height: 44px;
    line-height: 44px;
    text-align: center;
    background: #5077aa;
    color: #fff;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 100;
  }
</style>
