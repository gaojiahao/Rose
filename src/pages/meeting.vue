<template>
  <div class="pages">
    <h1 class="m_title">
      会议立项
      <span class="m_user" @click="goMylist">我的提交<x-icon class="right_arrow" type="ios-arrow-forward"
                                                         size="16"></x-icon></span>
    </h1>
    <div class="m_main">
      <div class="m_main_part">
        <group title="请填写会议安排明细">
          <datetime v-model="formData.begin" format="YYYY-MM-DD" title="开始日期"></datetime>
          <datetime v-model="formData.end" format="YYYY-MM-DD" title="结束日期"></datetime>
          <popup-picker title="省份" :data="provinceList" :value="provinceSelected" :columns="1"
                        @on-change="provinceChange" v-model="provinceSelected"></popup-picker>
          <popup-picker title="城市" :data="cityList" :value="citySelected" :columns="1"
                        @on-change="cityChange" v-model="citySelected"></popup-picker>
          <x-input :type="item.type" :title='item.title' :key="index" text-align='right'
                   v-for="(item, index) in meetList" v-model="formData[item.key]"></x-input>
        </group>
        <group title="请填写会议相关事宜">
          <x-textarea title="人员范围" v-model="formData.personScope"></x-textarea>
          <x-textarea title="会议议程" v-model="formData.agenda"></x-textarea>
        </group>
        <cascade-pickers :has-default="hasDefault" :value="cascadeValue" ref="cascadePickers"></cascade-pickers>
        <group title="费用合计">
          <cell title="金额合计" :value="totalCost"></cell>
        </group>
      </div>
    </div>
    <div class="m_btm vux-1px-t">
      <span class="count_part">合计:{{totalCost}}</span>
      <span class="m_button" @click="goflow">确定</span>
    </div>
    <loading :show="showLoading"></loading>
    <toast v-model="showToast" type="text" :text='toastText' is-show-mask position="middle" width='auto'></toast>
  </div>
</template>

<script>
  import createService from './../service/createService'
  import {Cell, Group, XInput, Datetime, XTextarea, PopupPicker, Toast, numberPad, numberComma} from 'vux'
  import Loading from './components/loading'
  import CascadePickers from './components/CascadePickers'
  import common from './mixins/common'

  export default {
    components: {
      Cell,
      Group,
      XInput,
      Datetime,
      Loading,
      XTextarea,
      PopupPicker,
      Toast,
      CascadePickers
    },
    data() {
      return {
        listid: '',
        meetList: [
          {
            title: '酒店名称',
            key: 'hotelName',
            type: 'text',
          }, {
            title: '房间均价',
            key: 'roomAveragePrice',
            type: 'number',
          }, {
            title: '房间数量',
            key: 'roomNumber',
            type: 'number',
          }, {
            title: '总人数',
            key: 'headCount',
            type: 'number',
          }, {
            title: '场地费用',
            key: 'siteFees',
            type: 'number',
          }, {
            title: '路费合计',
            key: 'wayFees',
            type: 'number',
          }, {
            title: '餐饮合计',
            key: 'repastFees',
            type: 'number',
          }
        ],
        formData: {
          'handlerName': '', // 经办人
          'handlerAreaName': '', // 所属区域
          'handlerUnitName': '', // 经办部门
          'handlerRoleName': '', // 经办角色
          'creatorName': '', // 创建者
          'crtTime': '', // 创建时间
          'modifer': '', // 修改者
          'modTime': '', // 修改时间
          'handerId': '', // 经办人id
          'transType': '会务立项申请', // 交易类型
          'handlerUnitId': '', // 经办部门id
          'handlerRoleId': '', // 经办角色id
          'cjz': '', // 创建者id
          'xgz': '', // 修改者id
          'handlerArea': '', // 所属区域id
          'province': '', // 省
          'city': '', // 市
          'hotelName': '', // 酒店名称
          'headCount': '', // 总人数
          'roomNumber': '', // 房间数量
          'roomAveragePrice': '', // 房间均价
          'siteFees': '', // 会议场地费用
          'hotelFees': '', // 住宿合计
          'wayFees': '', // 路费合计
          'repastFees': '', // 餐饮合计
          'meetingCostTotal': '', // 费用合计（会务立项）
          'personScope': '', // 人员范围
          'agenda': '', // 会议议程
          'begin': '', // 始于
          'end': '', // 止于
          'costBU': '',// 费用所属事业部
          'costDepartment': '',// 费用所属部门
          'checkProvince': '',// 核算归属省份
          'costBank': ''// 费用所属银行
        },
        provinceList: [],
        provinceSelected: [],
        cityList: [],
        citySelected: [],
        hasDefault: false,
        cascadeValue: {},
      }
    },
    computed: {
      // 合计金额
      totalCost() {
        let {roomNumber, roomAveragePrice, siteFees, wayFees, repastFees} = this.formData;
        return `￥${numberComma(Number(roomNumber) * Number(roomAveragePrice) + Number(siteFees) + Number(wayFees) + Number(repastFees))}`;
      },
      // 住宿合计
      hotelFees() {
        let {roomNumber, roomAveragePrice} = this.formData;
        return Number(roomNumber) * roomAveragePrice;
      },
    },
    mixins: [common],
    methods: {
      goMylist() { //我的提交
        this.$router.push({
          path: '/myList',
          query: {
            listId: this.listid
          }
        })
      },
      goflow() {
        this.formData.meetingCostTotal = this.totalCost.replace(/￥/g, '').replace(/,/g, '');
        this.formData.hotelFees = this.hotelFees;
        Object.assign(this.formData, this.$refs.cascadePickers.getFormData());
        console.log(this.formData)
        sessionStorage.setItem(`${this.listid}-FORMDATA`, JSON.stringify(this.formData));
        this.$router.push({
          path: '/flow',
          query: {
            list: this.listid
          }
        })
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
      // TODO 请求省份列表
      getProvinceList() {
        return createService.getAccountingUnitByid().then(data => {
          let {tableContent = []} = data;
          this.provinceList = tableContent && tableContent.map(item => {
            let {unitName} = item;
            return {
              name: unitName,
              value: unitName,
            }
          });
        })
      },
      // TODO 请求城市列表
      getCityList() {
        this.cityList = [];
        if (!this.hasDefault) {
          this.citySelected = [];
        }
        if (!this.formData.province) {
          return
        }
        createService.getAccountingUnitByid({
          key: 'N2',
          name1: this.formData.province
        }).then(data => {
          let {tableContent = []} = data;
          this.cityList = tableContent && tableContent.map(item => {
            let {unitName} = item;
            return {
              name: unitName,
              value: unitName,
            }
          });
        })
      },
      // TODO 切换省份
      provinceChange(val) {
        this.formData.province = val[0] || '';
        this.getCityList();
      },
      // TODO 切换城市
      cityChange(val) {
        this.formData.city = val[0] || '';
      },
      // TODO 时间戳转日期
      changeDate(d) {
        let date = new Date(d);
        return `${date.getFullYear()}-${numberPad(date.getMonth() + 1)}-${numberPad(date.getDate())}`
      },
      // TODO 获取表单详情
      getFormData() {
        let {query} = this.$route;
        this.hasDefault = true;
        createService.getFormData({
          formKey: query.formKey,
          transCode: query.transCode,
        }).then(data => {
          console.log(data)
          let {formData} = data;
          formData.begin = this.changeDate(formData.begin);
          formData.end = this.changeDate(formData.end);
          formData.crtTime = this.changeDate(formData.crtTime);
          formData.modTime = this.changeDate(formData.modTime);
          this.provinceSelected = [formData.province];
          this.citySelected = [formData.city];
          this.cascadeValue = {
            costBU: formData.costBU,// 费用所属事业部
            costDepartment: formData.costDepartment,// 费用所属部门
            checkProvince: formData.checkProvince,// 核算归属省份
            costBank: formData.costBank// 费用所属银行
          };
          this.formData = formData;
        })
      },
    },
    created() {
      let {query} = this.$route;
      this.uniqueId = query.view;
      this.listid = query.list;
      /*let now = this.getNow();
      this.formData.crtTime = now;
      this.formData.modTime = now;*/
      (async () => {
        this.showLoading = true;
        let requestPromises = [];
        /*await this.getUserInfo();
        requestPromises.push(this.initData());*/
        if (query.transCode) {
          this.getFormData();
        }
        requestPromises.push(this.getProvinceList());
        Promise.all(requestPromises).then(data => {
          this.showLoading = false;
        })
      })()
    }
  }
</script>

<style lang='scss' scoped>
  .m_title { //标题
    width: 100%;
    height: 120px;
    line-height: 80px;
    font-size: 34px;
    text-align: center;
    color: #fff;
    font-weight: 200;
    background: #5077AA;
    position: relative;
    .m_user {
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

  .m_main {
    width: 90%;
    max-width: 600px;
    position: absolute;
    top: 90px;
    left: 50%;
    transform: translate(-50%, 0);
    border-radius: 4px;
    z-index: 100;
    padding-bottom: 56px;
    .m_main_part {
      background: #fff;
      margin-top: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 10px #e8e8e8;
    }
  }

  .m_btm {
    width: 100%;
    height: 44px;
    line-height: 44px;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 101;
    margin-top: 20px;
    box-sizing: border-box;
    display: flex;
    .count_part {
      flex: 2.5;
      background: #fff;
      color: #000;
      display: inline-block;
      text-align: center;
      font-weight: bold;
    }
    .m_button {
      flex: 1;
      color: #fff;
      background: #5077AA;
      display: inline-block;
      text-align: center;
    }
  }

</style>
