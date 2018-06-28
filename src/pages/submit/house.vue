<template>
  <div class="pages house-container">
    <h1 class="h_title">
      房屋立项
    </h1>
    <div v-show="showPage">
      <div class="h_main">
        <div class="h_main_part">
          <group title="请选择地点类型">
            <popup-picker title="地点类型" :data="h_type" v-model="type_value" @on-change="officeChange"></popup-picker>
            <popup-picker title="处理类型" :data="h_hdtype" v-model="hd_value" @on-change="moveTypeChange"></popup-picker>
          </group>
          <group title="请填写明细">
            <x-input :type="item.type" :title='item.title' :key="index" text-align='right'
                     v-for="(item, index) in bj_list" v-model="formData[item.key]"></x-input>
            <datetime v-model="formData.begin" format="YYYY-MM-DD" title="租期开始时间"></datetime>
            <datetime v-model="formData.end" format="YYYY-MM-DD" title="租期结束时间"></datetime>
          </group>
          <cascade-pickers :has-default="hasDefault" :value="cascadeValue" ref="cascadePickers"></cascade-pickers>
        </div>
      </div>
      <div class="h_btm vux-1px-t">
        <span class="count_part">合计:{{totalCost}}</span>
        <span class="h_button" @click="goflow">确定</span>
      </div>
    </div>
    <loading :show="showLoading"></loading>
    <toast v-model="showToast" type="text" :text='toastText' is-show-mask position="middle" width='auto'></toast>
  </div>
</template>

<script>
  import {Cell, Group, XInput, Datetime, PopupPicker, numberComma} from 'vux'
  import createService from './../../service/createService'
  import CascadePickers from './../components/CascadePickers'
  import common from './../mixins/common'

  export default {
    components: {
      Cell,
      Group,
      XInput,
      Datetime,
      PopupPicker,
      CascadePickers,
    },
    data() {
      return {
        listid: '',
        h_type: [['省仓', '办事处']],
        type_value: [],
        h_hdtype: [['新增', '搬家']],
        hd_value: [],
        bj_list: [
          {
            title: '新增/搬家原因',
            key: 'moveReason',
            type: 'text',
          }, {
            title: '入驻人数',
            key: 'checkInNumber',
            type: 'number',
          }, {
            title: '房屋面积',
            key: 'area',
            type: 'text',
          }, {
            title: '月租',
            key: 'rental',
            type: 'number',
          }, {
            title: '付款方式',
            key: 'paymentType',
            type: 'text',
          }, {
            title: '租期',
            key: 'tenancy',
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
          'transType': '房屋立项申请', // 交易类型
          'handlerUnitId': '', // 经办部门id
          'handlerRoleId': '', // 经办角色id
          'cjz': '', // 创建者id
          'xgz': '', // 修改者id
          'handlerArea': '', // 所属区域id
          'office': '', // 省仓/办事处
          'moveType': '', // 异动类型
          'area': '', // 面积 (㎡)
          'checkInNumber': '', // 入驻人数
          'paymentType': '', // 付款方式 (月)
          'rental': '', // 月租
          'tenancy': '', // 租期 (月)
          'houseCostTotal': '', // 费用合计（房屋立项）
          'begin': '', // 始于
          'end': '', // 止于
          'moveReason': '', // 新增/搬家原因
          'costBU': '',// 费用所属事业部
          'costDepartment': '',// 费用所属部门
          'checkProvince': '',// 核算归属省份
          'costBank': ''// 费用所属银行
        },
        hasDefault: false,
        cascadeValue: {},
        sessionKey: '',
        formKey: '',
        transCode: '',
        showPage: true,
        taskId: '',
      }
    },
    mixins: [common],
    computed: {
      totalCost() {
        let {tenancy = 0, rental = 0} = this.formData;
        return `￥${numberComma(Number(tenancy) * Number(rental))}`;
      }
    },
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
        let lists = [
          {
            title: '地点类型',
            key: 'office',
            value: '',
          }, {
            title: '处理类型',
            key: 'moveType',
            value: '',
          }, {
            title: '新增/搬家原因',
            key: 'moveReason',
            value: '',
          }, {
            title: '入驻人数',
            key: 'checkInNumber',
            value: '',
          }, {
            title: '房屋面积',
            key: 'area',
            value: '',
          }, {
            title: '月租',
            key: 'rental',
            value: '',
          }, {
            title: '付款方式',
            key: 'paymentType',
            value: '',
          }, {
            title: '租期',
            key: 'tenancy',
            value: '',
          }, {
            title: '租期开始时间',
            key: 'begin',
            value: '',
          }, {
            title: '租期结束时间',
            key: 'end',
            value: '',
          }, {
            title: '费用所属事业部',
            key: 'costBU',
            value: '',
          }, {
            title: '费用所属部门',
            key: 'costDepartment',
            value: '',
          }, {
            title: '核算归属省份',
            key: 'checkProvince',
            value: '',
          }, {
            title: '费用所属银行',
            key: 'costBank',
            value: '',
          }
        ];
        let warn = '';
        this.formData.houseCostTotal = this.totalCost.replace(/￥/g, '').replace(/,/g, '');
        Object.assign(this.formData, this.$refs.cascadePickers.getFormData());
        lists.every(item => {
          if (!this.formData[item.key]) {
            warn = `${item.title}不能为空`;
            return false
          }
          return true
        });
        if (warn) {
          this.showToastText(warn);
          return
        }
        sessionStorage.setItem(this.sessionKey, JSON.stringify(this.formData));
        this.$router.push({
          path: '/flow',
          query: {
            list: this.listid,
            taskId: this.taskId,
          }
        })
      },
      // TODO 地点类型切换
      officeChange(val) {
        this.formData.office = val[0] || '';
      },
      // TODO 处理类型切换
      moveTypeChange(val) {
        this.formData.moveType = val[0] || '';
      },
      // TODO 获取表单详情
      getFormData() {
        return createService.getFormData({
          formKey: this.formKey,
          transCode: this.transCode,
        }).then(data => {
          this.hasDefault = true;
          this.showPage = true;
          let {formData = {}, success = true, message = ''} = data;
          // 请求失败提示
          if (!success) {
            this.showToastText(message);
            return;
          }

          formData.begin = this.changeDate(formData.begin);
          formData.end = this.changeDate(formData.end);
          // formData.crtTime = this.changeDate(formData.crtTime, true);
          // formData.modTime = this.changeDate(formData.modTime, true);

          this.type_value = [formData.office];
          this.hd_value = [formData.moveType];

          this.cascadeValue = {
            costBU: formData.costBU,
            costDepartment: formData.costDepartment,
            checkProvince: formData.checkProvince,
            costBank: formData.costBank
          };

          this.formData = formData;
          this.$nextTick(() => {
            // 在渲染一次以后将该值设置为false
            this.hasDefault = false;
          })
        }).catch(e => {
          this.showToastText(e.message);
        });
      },
    },
    beforeRouteLeave(to, from, next) {
      let {name} = to;
      if (name === 'Home') {
        // 删除session
        sessionStorage.removeItem(this.sessionKey)
      }
      next();
    },
    created() {
      let {query} = this.$route;
      let requestPromises = [];
      this.listid = query.list;
      this.formKey = query.formKey;
      this.transCode = query.transCode;
      this.taskId = query.taskId;
      this.sessionKey = `${this.listid}-FORMDATA`;
      this.showLoading = true;
      let formData = sessionStorage.getItem(this.sessionKey);
      if (formData) {
        formData = JSON.parse(formData);
        // 先将时间赋值，在mounted中赋值会失败
        this.formData.begin = formData.begin;
        this.formData.end = formData.end;
      }

      // 从接口中获取数据
      if (!formData && this.formKey) {
        this.showPage = false;
        requestPromises.push(this.getFormData());
      }

      this.$nextTick(() => {
        requestPromises.push(this.$refs.cascadePickers.init());
        Promise.all(requestPromises).then(data => {
          this.showLoading = false;
        })
      })
    },
    mounted() {
      let formData = sessionStorage.getItem(this.sessionKey);
      if (formData) {
        this.hasDefault = true;
        formData = JSON.parse(formData);
        this.formData = formData;
        this.type_value = [formData.office];
        this.hd_value = [formData.moveType];
        this.cascadeValue = {
          costBU: formData.costBU,
          costDepartment: formData.costDepartment,
          checkProvince: formData.checkProvince,
          costBank: formData.costBank
        };
        sessionStorage.removeItem(this.sessionKey);
        this.$nextTick(() => {
          // 在渲染一次以后将该值设置为false
          this.hasDefault = false;
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  .house-container {
    .h_title { //标题
      width: 100%;
      height: 80px;
      line-height: 80px;
      font-size: 34px;
      text-align: center;
      color: #fff;
      font-weight: 200;
      background: #5077AA;
      position: relative;
      .h_user {
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

    .h_main {
      width: 90%;
      max-width: 600px;
      position: absolute;
      top: 50px;
      left: 50%;
      transform: translate(-50%, 0);
      border-radius: 4px;
      z-index: 100;
      padding-bottom: 56px;
      .h_main_part {
        background: #fff;
        margin-top: 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px #e8e8e8;
      }
    }

    .h_btm {
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
      .h_button {
        flex: 1;
        color: #fff;
        background: #5077AA;
        display: inline-block;
        text-align: center;
      }
    }
  }
</style>
