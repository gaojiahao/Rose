<template>
  <div class="pages">
    <h1 class="f_title">
      确定工作流
    </h1>
    <div class="f_main">
      <group title="请填写对应的信息" class="info-container">
        <x-input :title="item.name" text-align='right' @on-focus="searchFocus(item, index)" @on-change="getSearch(item)"
                 @on-blur="searchBlur(item)"
                 v-for="(item, index) in level_list" :key="index" v-model="item.value"></x-input>
        <cell title="财务" value='财务'></cell>
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
        if (key === 'committee') {
          this.searchListTop = '83px';
        } else if (key === 'president') {
          this.searchListTop = '130px';
        }
      },
      // TODO 失去输入框焦点
      searchBlur(item) {
        if (this.hasSelected) {
          return
        }
        let [matchObj = {}] = this.searchList.filter(sItem => {
          return sItem.name === item.value
        });
        if (matchObj.userId) {
          item.userId = matchObj.userId;
          item.value = matchObj.name;
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
        if (!value || this.hasSelected) {
          return
        }
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
        /*createService.saveAndStartWf({
          listId: this.listid,
          biComment: '',
          formData: JSON.stringify(this.formData),
          wfPara: JSON.stringify({
            'PROC_1806_0005': {
              'businessKey': 'KFSCPCGRK',
              'createdBy': '',
              '常委ID': this.level_list.committee.userId,
              '副总裁ID': this.level_list.president.userId,
            }
          })
        }).then(data => {
          console.log(data)
          let {message, success} = data;
          if (success && message.indexOf('null') === -1) {
            this.showToastText('提交成功');
          } else {
            this.showToastText('提交失败');
          }
        }).catch(e => {
          this.showToastText(e.message);
        })*/
      },
    },
    created() {
      let {query} = this.$route;
      this.listid = query.list;
      let now = this.getNow();
      let formData = JSON.parse(sessionStorage.getItem(`${this.listid}-FORMDATA`) || "{}");
      this.formData = Object.assign({}, formData);
      this.formData.crtTime = now;
      this.formData.modTime = now;
      this.getProcess();
      (async () => {
        this.showLoading = true;
        let requestPromises = [];
        await this.getUserInfo();
        requestPromises.push(this.initData());
        Promise.all(requestPromises).then(data => {
          this.showLoading = false;
        })
      })();
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
    background: #fff;
    top: 70px;
    left: 50%;
    transform: translate(-50%, 0);
    border-radius: 4px;
    z-index: 100;
    box-shadow: 0 2px 10px #e8e8e8;
    // padding-bottom:56px;

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
