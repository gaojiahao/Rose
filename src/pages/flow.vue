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
    <toast v-model="showToast" type="text" :text='toastText' is-show-mask position="middle" width='auto'></toast>
  </div>
</template>

<script>
  import {Flow, Cell, Group, XInput, FlowState, FlowLine, numberPad, Toast} from "vux";
  import createService from './../service/createService'
  import Loading from './components/loading'
  import common from './mixins/common'

  export default {
    components: {
      Flow,
      Cell,
      Group,
      XInput,
      FlowLine,
      FlowState,
      Loading,
      Toast,
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
          },
          president: {
            name: '副总',
            searchType: 'president',
            value: '',
            userId: '',
          }
        },
        searchList: [], // 搜索结果列表
        searchType: '', // 当前聚焦的输入框类型
        hasSelected: false, // 是否选中搜索项
        formData: {}, // 表单数据
        procCode: '',
        searchListTop: 0,
        sessionKey: '',
        taskId: '',
      };
    },
    mixins: [common],
    methods: {
      // TODO 获取节点
      getProcess() {
        createService.getProcess({
          listId: this.listid
        }).then(data => {
          this.procCode = data[0] && data[0].procCode || '';
        }).catch(e => {
          // this.showToastText(e.message);
        });
      },
      // TODO 获取用户信息
      getUserInfo() {
        return createService.getUser().then(data => {
          this.userInfo = data;
          return data;
        });
      },
      // TODO 初始化基本信息
      async initData() {
        // 设置经办人信息
        let currentUser = await createService.getCurrentUser(this.userInfo.nickname).then(data => {
          let currentUser = data.tableContent[0] || {};
          let {nickname = '', userId = ''} = currentUser;
          this.formData.handlerName = nickname;
          this.formData.creatorName = nickname;
          this.formData.modifer = nickname;
          this.formData.handerId = userId;
          this.formData.cjz = userId;
          return currentUser
        });
        // 设置所属区域信息
        let area = await createService.getRemoteData('/H_roleplay-si/ds/getAreasByUserId', {
          userId: currentUser.userId
        }).then(data => {
          let {tableContent = []} = data;
          let area = tableContent[0] || {};
          this.formData.handlerAreaName = area.userGroupName || '';
          this.formData.handlerArea = area.userGroupId || '';
          return area;
        });
        // 设置经办部门信息
        let dept = await createService.getRemoteData('/H_roleplay-si/ds/getUnitsByUserId', {
          userId: currentUser.userId,
          parentId: area.userGroupId
        }).then(data => {
          let {tableContent = []} = data;
          let dept = tableContent[0] || {};
          this.formData.handlerUnitName = dept.userGroupName || '';
          this.formData.handlerUnitId = dept.userGroupId || '';
          return dept;
        });
        // 设置经办角色信息
        let role = await createService.getRemoteData('/H_roleplay-si/ds/getRolesByUserId', {
          userId: currentUser.userId,
          parentId: dept.userGroupId
        }).then(data => {
          let {tableContent = []} = data;
          let role = tableContent[0] || {};
          this.formData.handlerRoleName = role.userGroupName || '';
          this.formData.handlerRoleId = role.userGroupId || '';
        });
      },
      // TODO 获取当前时间
      getNow(fmt = 'Y-m-d H:i:s') {
        let date = new Date();
        let dateObj = {
          Y: date.getFullYear(),
          m: numberPad(date.getMonth() + 1),
          d: numberPad(date.getDate()),
          H: numberPad(date.getHours()),
          i: numberPad(date.getMinutes()),
          s: numberPad(date.getSeconds()),
        };
        let dateStr = fmt;
        Object.entries(dateObj).forEach(([key, value]) => {
          dateStr = dateStr.replace(key, value);
        });
        return dateStr
      },
      // TODO 点击常委、副总输入框
      searchFocus(item, key) {
        this.hasSelected = false;
        this.searchList = [];
        this.searchType = item.searchType;
        // 设置搜索框顶部偏移
        if (key === 'committee') {
          this.searchListTop = '83px';
        } else if (key === 'president') {
          this.searchListTop = '130px';
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
        if (this.searchType === 'president') {
          params.name = '副总裁'
        }
        createService.getChangWei(params).then(data => {
          let {tableContent = []} = data;
          this.searchList = tableContent && tableContent.map(item => {
            return {
              userId: item.userId,
              name: item.nickname,
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
      },
      // TODO 提交数据
      submitData() {
        let warn = '';
        let submitData = {};
        let wfPara = {};
        let submitMethod = 'saveAndStartWf';
        Object.values(this.level_list).every(item => {
          if (!item.userId) {
            warn = `${item.name}不能为空`;
            return false
          }
          return true
        });
        if (warn) {
          this.showToastText(warn);
          return
        }
        wfPara = {
          'PROC_1806_0005': {
            'businessKey': 'KFSCPCGRK',
            'createdBy': '',
            // '常委ID': this.level_list.committee.userId,
            // '副总裁ID': this.level_list.president.userId,
            '常委ID': '15125', // rfd120
            '副总裁ID': '18128', // rfd9527
          }
        };
        // 判断是否为重新提交
        if (this.taskId) {
          wfPara.taskId = this.taskId;
          wfPara.result = 1;
          submitMethod = 'saveAndCommitTask';
          submitData.biReferenceId = this.formData.biReferenceId;
        }
        Object.assign(submitData, {
          listId: this.listid,
          biComment: '',
          formData: JSON.stringify(this.formData),
          wfPara: JSON.stringify(wfPara),
        });
        this.showLoading = true;
        createService[submitMethod](submitData).then(data => {
          this.showLoading = false;
          let {message, success} = data;
          if (success && message.indexOf('null') === -1) {
            this.showToastText('提交成功');
            sessionStorage.removeItem(this.sessionKey);
            setTimeout(() => {
              this.$router.push('/')
            }, 1000)
          } else {
            this.showToastText('提交失败');
          }
        }).catch(e => {
          this.showToastText(e.message);
        })
      },
      // TODO 初始化基本信息
      getBaseInfo() {
        return createService.getBaseInfoData().then(data => {
          let {nickname, userId, area, areaID, groupName, groupNameID, position, roleID} = data;
          area = area.split(',')[0];
          areaID = areaID.split(',')[0];
          groupName = groupName.split(',')[0];
          groupNameID = groupNameID.split(',')[0];
          position = position.split(',')[0];
          roleID = roleID.split(',')[0];
          this.formData.handlerName = nickname;
          this.formData.creatorName = nickname;
          this.formData.modifer = nickname;
          this.formData.handerId = userId;
          this.formData.cjz = userId;
          this.formData.handlerAreaName = area;
          this.formData.handlerArea = areaID;
          this.formData.handlerUnitName = groupName;
          this.formData.handlerUnitId = groupNameID;
          this.formData.handlerRoleName = position;
          this.formData.handlerRoleId = roleID;
        })
      },
    },
    created() {
      let {query} = this.$route;
      this.listid = query.list;
      this.taskId = query.taskId;
      this.sessionKey = `${this.listid}-FORMDATA`;
      let now = this.getNow();
      let formData = JSON.parse(sessionStorage.getItem(this.sessionKey) || "{}");
      this.formData = Object.assign({}, formData);
      this.formData.crtTime = now;
      this.formData.modTime = now;
      // this.getProcess();
      /*(async () => {
        this.showLoading = true;
        let requestPromises = [];
        await this.getUserInfo();
        requestPromises.push(this.initData());
        Promise.all(requestPromises).then(data => {
          this.showLoading = false;
        })
      })();*/
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
    z-index: 100;
    width: 100%;
    max-height: 300px;
    background-color: #eee;
    color: #000;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    .weui-cells {
      margin-top: 0;
    }
    .weui-cell {
      background-color: #ccc;
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
