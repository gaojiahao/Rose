<template>
  <div class="pages flow-container">
    <h1 class="f_title">
      确定工作流
    </h1>
    <div class="f_main">
      <div class="f_main_wrapper">
        <group title="请填写对应的信息" class="info-container">
          <x-input :title="item.name" text-align='right' @on-focus="searchFocus(item, index)"
                   @on-change="getSearch(item)"
                   @on-blur="searchBlur(item)"
                   v-for="(item, index) in level_list" :key="index" v-model="item.value"></x-input>
          <cell title="财务" value='管建明'></cell>
          <cell title="总裁" value='王珏'></cell>
        </group>
        <group class="search-list-container" v-show="!hasSelected" :style="{top: searchListTop}">
          <cell :title="item.name" v-for="(item, index) in searchList" :key="index"
                @click.native="searchItemClick(item)" @touchmove.stop=""></cell>
        </group>
        <div class="f_flow">
          <group title="流程图"></group>
          <flow orientation="vertical" style="height:300px;float:left;padding:10px 20px">
            <flow-state state="1" title="省长" is-done></flow-state>
            <flow-line tip="进行中" tip-direction='right'></flow-line>
            <flow-state state="2">
              <span slot="title">常委</span>
            </flow-state>
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
  import {Flow, Cell, Group, XInput, FlowState, FlowLine} from "vux";
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
    },
    data() {
      return {
        showLoading: false,
        level_list: {
          committee: {
            name: '常委',
            searchType: 'committee',
            value: '',
            userId: '',
            data: {},
          },
          vicePresident: {
            name: '副总',
            searchType: 'vicePresident',
            value: '',
            userId: '',
            data: {},
          }
        },
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
      // TODO 获取用户信息
      getUserInfo() {
        return createService.getUser().then(data => {
          this.userInfo = data;
          return data;
        });
      },
      // TODO 点击常委、副总输入框
      searchFocus(item, key) {
        this.hasSelected = false;
        this.searchList = [];
        this.searchType = item.searchType;
        // 设置搜索框顶部偏移
        if (key === 'committee') {
          this.searchListTop = '81px';
        } else if (key === 'vicePresident') {
          this.searchListTop = '126px';
        }
      },
      // TODO 失去输入框焦点
      searchBlur(item) {
        // 判断是否选中值
        if (this.hasSelected) {
          return
        }
        // 获取匹配项
        let [matchObj = {}] = this.searchList.filter(sItem => {
          return sItem.name === item.value
        });
        // 如果有匹配项则设置匹配项为选中项
        if (matchObj.userId) {
          item.userId = matchObj.userId;
          item.value = matchObj.name;
          item.data = {...matchObj};
          this.hasSelected = true;
        }
      },
      // TODO 请求搜索列表
      getSearch(item) {
        let {value} = item;
        let params = {
          filter: JSON.stringify([{
            operator: 'like',
            value: value,
            property: 'nickname'
          }])
        };
        // 有选中项则不进行搜索
        if (!value || this.hasSelected) {
          return
        }
        item.userId = '';
        // 搜索为副总
        if (this.searchType === 'vicePresident') {
          params.name = '副总裁'
        }
        createService.getChangWei(params).then(data => {
          let {tableContent = []} = data;
          this.searchList = tableContent && tableContent.map(item => {
            return {
              id: '',
              userId: item.userId,
              name: item.nickname,
              ...item,
            }
          })
        })
      },
      // TODO 点击搜索项
      searchItemClick(item) {
        this.hasSelected = true;
        let {name, userId} = item;
        this.level_list[this.searchType].value = name;
        this.level_list[this.searchType].userId = userId;
        this.level_list[this.searchType].data = {...item};
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
        // 校验数据
        Object.values(this.level_list).every(item => {
          if (!item.userId) {
            warn = `${item.name}不能为空`;
            return false
          }
          return true
        });
        if (warn) {
          this.showToast(warn);
          return
        }
        let {committee, vicePresident} = this.level_list;
        this.jsonData['$review'] = {
          cw: this.assembleOpData(committee),
          'warehouse.fzc': this.assembleOpData(vicePresident)
        };
        wfPara = {
          [this.procCode]: {
            'businessKey': transCode,
            'createdBy': '',
            '常委ID': committee.userId,
            '副总裁ID': vicePresident.userId,
            // '常委ID': '15125', // rfd120
            // '副总裁ID': '18128', // rfd9527
          }
        };
        // 判断是否为重新提交
        if (this.taskId) {
          wfPara = {
            taskId: this.taskId,
            businessKey: transCode,
            createdBy: this.currentUser.user,
            '所属区域': "总部",
            '常委ID': committee.userId,
            '副总裁ID': vicePresident.userId,
            transCode,
            result: 3,
            comment: ''
          }
          submitMethod = 'saveAndCommitTaskOld';
          // wfPara.taskId = this.taskId;
          // wfPara.result = 1;
          // submitData.biReferenceId = this.formData.biReferenceId;
        }
        Object.assign(submitData, {
          jsonData: JSON.stringify(this.jsonData),
          wfPara: JSON.stringify(wfPara),
        });
        console.log(submitData)
        // this.showLoading = true;
        createService[submitMethod](submitData).then(data => {
          this.showLoading = false;
          let {message, success} = data;
          if (success && message.indexOf('null') === -1) {
            this.showToast('提交成功');
            /*sessionStorage.removeItem(this.sessionKey);
            setTimeout(() => {
              this.$router.go(-2);
            }, 1200)*/
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
      assembleOpData(op) {
        return {
          text: op.name,
          value: op.userId,
          selection: {
            data: op.data
          }
        }
      },
      // TODO 初始化基本信息
      getBaseInfo() {
        let handleBaseInfo = (data = {}) => {
          let {nickname = '', userId = '', area = '', areaID = '', groupName = '', groupNameID = '', position = '', roleID = ''} = data;
          this.currentUser = data;
          createService.getCurrentUser(nickname).then(({tableContent = []}) => {
            let [handlerData = {}] = tableContent;
            area = area.split(',')[0];
            areaID = areaID.split(',')[0];
            groupName = groupName.split(',')[0];
            groupNameID = groupNameID.split(',')[0];
            position = position.split(',')[0];
            roleID = roleID.split(',')[0];

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
      restoreLevelList() {
        let review = {...this.jsonData.$review};
        this.level_list = {
          committee: {
            name: '常委',
            searchType: 'committee',
            value: review.cw.text || '',
            userId: review.cw.value || '',
            data: review.cw.selection.data || {},
          },
          vicePresident: {
            name: '副总',
            searchType: 'vicePresident',
            value: review['warehouse.fzc'].text || '',
            userId: review['warehouse.fzc'].value || '',
            data: review['warehouse.fzc'].selection.data || {},
          }
        }
      },
    },
    created() {
      let {query} = this.$route;
      this.listid = query.list;
      this.taskId = query.taskId;
      this.sessionKey = `${this.listid}-FORMDATA`;
      let now = this.changeDate(new Date(), true);
      let jsonData = JSON.parse(sessionStorage.getItem(this.sessionKey) || "{}");
      this.jsonData = jsonData;
      this.formData = Object.assign({}, jsonData);
      // 修改时有创建时间，使用原来的创建时间
      this.jsonData.baseinfo.crtTime = jsonData.baseinfo.crtTime ? this.changeDate(jsonData.baseinfo.crtTime, true) : now;
      this.jsonData.baseinfo.modTime = now;
      if (this.taskId) {
        this.restoreLevelList();
      }
      this.getProcess();
      this.showLoading = true;
      this.getBaseInfo().then(data => {
        this.showLoading = false;
      })
    }
  };
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
