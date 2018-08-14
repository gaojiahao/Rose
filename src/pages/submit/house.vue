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
            <popup-picker title="省份" :data="provinceList" :value="provinceSelected" :columns="1"
                          @on-change="provinceChange" v-model="provinceSelected"></popup-picker>
            <x-input :type="item.type" :title="item.title" :key="index" text-align="right"
                     v-for="(item, index) in bj_list" v-model="formData[item.key]"></x-input>
            <popup-picker title="付款方式" :data="paymentList" v-model="paymentSelected"
                          @on-change="paymentChange"></popup-picker>
            <popup-radio title="是否中介" :options="zj_list" v-model="formData.intermediary"></popup-radio>
            <x-input type="number" title="中介费" text-align="right" v-model="formData.intermediaryFee"
                     v-show="formData.intermediary === '是'"></x-input>

            <datetime v-model="formData.begin" format="YYYY-MM-DD" title="租期开始时间"></datetime>
            <datetime v-model="formData.end" format="YYYY-MM-DD" title="租期结束时间"></datetime>
          </group>
          <cascade-pickers :has-default="hasDefault" :value="cascadeValue" ref="cascadePickers"></cascade-pickers>
        </div>
      </div>
      <div class="h_btm vux-1px-t">
        <!--<span class="count_part">合计:{{totalCost}}</span>-->
        <span class="h_button" @click="goflow">确定</span>
      </div>
    </div>
    <loading :show="showLoading"></loading>
  </div>
</template>

<script>
  import {Cell, Group, XInput, Datetime, PopupPicker, numberComma, PopupRadio} from 'vux'
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
      PopupRadio,
    },
    data() {
      return {
        listId: '',
        h_type: [['省仓', '办事处']],
        type_value: [],
        h_hdtype: [['新增', '搬家']],
        hd_value: [],
        zj_list: ['否', '是'], // 是否有中介
        paymentList: [['月付', '季付', '半年付', '年付']],
        paymentSelected: [],
        bj_list: [
          {
            title: '新增/搬家原因',
            key: 'moveReason',
            type: 'text',
          }, {
            title: '房屋面积',
            key: 'area',
            type: 'number',
          }, {
            title: '入住人数',
            key: 'checkInNumber',
            type: 'number',
          }, {
            title: '月租',
            key: 'rental',
            type: 'number',
          }, {
            title: '押金',
            key: 'deposit',
            type: 'number',
          }
        ],
        formData: {
          office: '', // 省仓/办事处
          moveType: '', // 异动类型
          province: '', // 省份
          area: '', // 面积 (㎡)
          checkInNumber: '', // 入住人数
          paymentType: '', // 付款方式 (月)
          rental: '', // 月租
          deposit: '', // 押金
          intermediary: '否', // 是否中介
          intermediaryFee: '', // 中介费
          begin: '', // 始于
          end: '', // 止于
          moveReason: '', // 新增/搬家原因
          costBU: '',// 费用所属事业部
          costDepartment: '',// 费用所属部门
        },
        hasDefault: false,
        cascadeValue: {},
        sessionKey: '',
        formKey: '',
        transCode: '',
        showPage: true,
        taskId: '',
        provinceList: [], // 省份列表
        provinceSelected: [],
        baseinfo: {},
      }
    },
    mixins: [common],
    computed: {
      totalCost() {
        let {deposit = 0, rental = 0, intermediaryFee = 0} = this.formData;
        return `￥${numberComma(Number(deposit) * Number(rental) + Number(intermediaryFee))}`;
      }
    },
    methods: {
      goMylist() { //我的提交
        this.$router.push({
          path: '/myList',
          query: {
            listId: this.listId
          }
        })
      },
      goflow() {
        let lists = [
          {
            title: '地点类型',
            key: 'office',
          }, {
            title: '处理类型',
            key: 'moveType',
          }, {
            title: '省份',
            key: 'province',
          }, {
            title: '新增/搬家原因',
            key: 'moveReason',
          }, {
            title: '房屋面积',
            key: 'area',
          }, {
            title: '入住人数',
            key: 'checkInNumber',
          }, {
            title: '月租',
            key: 'rental',
          }, {
            title: '押金',
            key: 'deposit',
          }, {
            title: '付款方式',
            key: 'paymentType',
          }, {
            title: '租期开始时间',
            key: 'begin',
          }, {
            title: '租期结束时间',
            key: 'end',
          }, {
            title: '费用所属事业部',
            key: 'costBU',
          }, {
            title: '费用所属部门',
            key: 'costDepartment',
          }
        ];
        let jsonData = {
          listId: this.listId,
          referenceId: this.guid(),
        };
        let warn = '';
        // this.formData.houseCostTotal = this.totalCost.replace(/￥/g, '').replace(/,/g, '');
        Object.assign(this.formData, this.$refs.cascadePickers.getFormData());
        lists.every(item => {
          if (!this.formData[item.key]) {
            warn = `${item.title}不能为空`;
            return false
          }
          return true
        });
        if (warn) {
          this.showToast(warn);
          return
        }
        let formData = this.formData;
        let [province] = this.provinceList.filter(item => item.name === formData.province);
        // 重新提交
        if (this.transCode) {
          jsonData.referenceId = this.formData.referenceId;
          jsonData.$review = this.formData.review;
          jsonData.$review2 = this.formData.review2;
        }
        jsonData.baseinfo = {
          id: this.guid(),
          transType2: '房屋立项申请',
          zhuti: '国富黄金',
          effectiveTime: '',
          transCode: 'KFSCPCGRK',
          statusText: '',
          transType: 'tspcchin',
          status: '',
          comment: '',
          fj: [],
          ...this.baseinfo,
        };
        // 日期
        jsonData['baseinfoExt#zq'] = {
          id: this.guid(),
          datetime1: formData.begin,
          datetime2: formData.end,
          varchar3: formData.moveReason, // 搬家原因
        };

        jsonData['baseinfoExt#mx'] = {
          id: this.guid(),
          varchar10: this.assembleDropDownData(formData.office),
          varchar1: this.assembleDropDownData(formData.moveType),
          varchar11: {
            text: province.value,
            selection: {
              data: province.origin,
            },
            value: province.value
          },
          double3: Number(formData.area), // 面积
          double5: Number(formData.intermediaryFee), // 中介费
          integer1: Number(formData.checkInNumber), // 入住人数
          varchar2: this.assembleDropDownData(formData.paymentType), // 付款方式
          double1: Number(formData.rental), // 月租
          integer2: null, // 租期
          integer5: formData.intermediary === '是' ? 1 : 0, // 是否为中介
          double4: Number(formData.deposit), // 押金
        };
        // 所属部门
        jsonData['baseinfoExt#gs'] = {
          id: this.guid(),
          varchar4: this.assembleDropDownData(formData.costBU, 'dep'),
          varchar5: this.assembleDropDownData(formData.costDepartment, 'dep'),
          // $varchar6: this.assembleDropDownData(),
          // $varchar7: this.assembleDropDownData(),
        };
        jsonData['$comment'] = {
          'baseinfo.comment': jsonData.baseinfo.comment
        };
        jsonData['baseinfo.fj'] = [];
        jsonData.transCode = jsonData.baseinfo.transCode;

        sessionStorage.setItem(this.sessionKey, JSON.stringify(jsonData));
        this.$router.push({
          path: '/flow',
          query: {
            list: this.listId,
            taskId: this.taskId,
          }
        })
      },
      // TODO 组装下拉框的提交数据
      assembleDropDownData(value = '', dataKey = 'text') {
        return {
          text: value,
          selection: {
            data: {
              [dataKey]: value,
              id: ''
            }
          },
          value,
        }
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
      getJsonData() {
        return createService.getJsonData(this.transCode).then(({tableContent = []}) => {
          let [data = {}] = tableContent;
          let jsonData = JSON.parse(data.json_data || '{}');
          this.hasDefault = true;
          this.showPage = true;

          this.restoreJsonData(jsonData);
          this.$nextTick(() => {
            // 在渲染一次以后将该值设置为false
            this.hasDefault = false;
          })
        }).catch(e => {
          this.showToast(e.message);
        });
      },
      // TODO 请求省份列表
      getProvinceList() {
        return createService.getProvinceForWarehouse().then(data => {
          let {tableContent = []} = data;
          this.provinceList = tableContent && tableContent.map(item => {
            let {name} = item;
            return {
              name,
              value: name,
              origin: {...item}
            }
          });
        }).catch(e => {
          this.showToast(e.message);
        });
      },
      // TODO 切换省份
      provinceChange(val) {
        this.formData.province = val[0] || '';
      },
      // TODO 切换付款方式
      paymentChange(val) {
        this.formData.paymentType = val[0] || '';
      },
      // TODO 还原数据
      restoreJsonData(jsonData) {
        console.log(jsonData)
        let {baseinfo} = jsonData;
        let gs = {...jsonData['baseinfoExt#gs']};
        let mx = {...jsonData['baseinfoExt#mx']};
        let zq = {...jsonData['baseinfoExt#zq']};
        let formData = {
          referenceId: jsonData.referenceId,
          office: mx.varchar10 && mx.varchar10.value, // 省仓/办事处
          moveType: mx.varchar1 && mx.varchar1.value, // 异动类型
          province: mx.varchar11 && mx.varchar11.value, // 省份
          area: mx.double3, // 面积 (㎡)
          checkInNumber: mx.integer1, // 入住人数
          paymentType: mx.varchar2 && mx.varchar2.value, // 付款方式 (月)
          rental: mx.double1, // 月租
          deposit: mx.double4, // 押金
          intermediary: mx.integer5 === 1 ? '是' : '否', // 是否中介
          intermediaryFee: mx.double5, // 中介费
          begin: zq.datetime1, // 始于
          end: zq.datetime2, // 止于
          moveReason: zq.varchar3, // 新增/搬家原因
          costBU: gs.varchar4 && gs.varchar4.value,// 费用所属事业部
          costDepartment: gs.varchar5 && gs.varchar5.value,// 费用所属部门
          review: jsonData.review,
          review2: jsonData.review2,
        };
        this.baseinfo = baseinfo;

        this.type_value = [formData.office];
        this.hd_value = [formData.moveType];
        this.provinceSelected = [formData.province];
        this.paymentSelected = [formData.paymentType];

        this.cascadeValue = {
          costBU: formData.costBU,
          costDepartment: formData.costDepartment,
        };
        this.formData = formData;
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
      this.listId = query.list;
      this.formKey = query.formKey;
      this.transCode = query.transCode;
      this.taskId = query.taskId;
      this.sessionKey = `${this.listId}-FORMDATA`;
      this.showLoading = true;
      let formData = sessionStorage.getItem(this.sessionKey);
      if (formData) {
        formData = JSON.parse(formData);
        // 先将时间赋值，在mounted中赋值会失败
        this.restoreJsonData(formData);
      }

      // 从接口中获取数据
      if (!formData && this.formKey) {
        this.showPage = false;
        requestPromises.push(this.getJsonData());
      }

      this.$nextTick(() => {
        requestPromises.push(this.getProvinceList());
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
        this.restoreJsonData(formData);
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
