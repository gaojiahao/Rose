<template>
  <div class="pages meeting-container">
    <h1 class="m_title">会议立项</h1>
    <div v-show="showPage">
      <div class="m_main">
        <base-info :default-value="baseinfo" ref="baseinfo"></base-info>
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
    </div>
    <loading :show="showLoading"></loading>
  </div>
</template>

<script>
  import createService from './../../service/createService'
  import {Cell, Group, XInput, Datetime, XTextarea, PopupPicker, numberComma} from 'vux'
  import CascadePickers from './../components/CascadePickers'
  import BaseInfo from './../components/BaseInfo'
  import common from './../mixins/common'

  export default {
    components: {
      Cell,
      Group,
      XInput,
      Datetime,
      XTextarea,
      PopupPicker,
      CascadePickers,
      BaseInfo,
    },
    data() {
      return {
        listId: '',
        meetList: [
          {
            title: '酒店名称',
            key: 'hotelName',
            type: 'text',
          }, {
            title: '总人数',
            key: 'headCount',
            type: 'number',
          }, {
            title: '房间数量',
            key: 'roomNumber',
            type: 'number',
          }, {
            title: '天数',
            key: 'dayCount',
            type: 'number',
          }, {
            title: '房间均价',
            key: 'roomAveragePrice',
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
          province: '', // 省
          city: '', // 市
          hotelName: '', // 酒店名称
          headCount: '', // 总人数
          roomNumber: '', // 房间数量
          dayCount: '', // 天数
          roomAveragePrice: '', // 房间均价
          siteFees: '', // 会议场地费用
          hotelFees: '', // 住宿合计
          wayFees: '', // 路费合计
          repastFees: '', // 餐饮合计
          personScope: '', // 人员范围
          agenda: '', // 会议议程
          begin: '', // 始于
          end: '', // 止于
          costBU: '',// 费用所属事业部
          costDepartment: '',// 费用所属部门
        },
        provinceList: [],
        provinceSelected: [],
        cityList: [],
        citySelected: [],
        hasDefault: false,
        cascadeValue: {},
        sessionKey: '',
        formKey: '',
        transCode: '',
        showPage: true,
        taskId: '',
        baseinfo: {},
      }
    },
    computed: {
      // 合计金额
      totalCost() {
        let {roomNumber = 0, roomAveragePrice = 0, siteFees = 0, wayFees = 0, repastFees = 0, dayCount = 0} = this.formData;
        return `￥${numberComma(Number(roomNumber) * Number(roomAveragePrice) * Number(dayCount) + Number(siteFees) + Number(wayFees) + Number(repastFees))}`;
      },
      // 住宿合计
      hotelFees() {
        let {roomNumber = 0, roomAveragePrice = 0, dayCount = 0} = this.formData;
        return Number(roomNumber) * roomAveragePrice * Number(dayCount);
      },
    },
    mixins: [common],
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
            title: '开始日期',
            key: 'begin',
          }, {
            title: '结束日期',
            key: 'end',
          }, {
            title: '省份',
            key: 'province',
          }, {
            title: '城市',
            key: 'city',
          }, {
            title: '酒店名称',
            key: 'hotelName',
          }, {
            title: '总人数',
            key: 'headCount',
          }, {
            title: '房间数量',
            key: 'roomNumber',
          }, {
            title: '天数',
            key: 'dayCount',
          }, {
            title: '房间均价',
            key: 'roomAveragePrice',
          }, {
            title: '场地费用',
            key: 'siteFees',
          }, {
            title: '路费合计',
            key: 'wayFees',
          }, {
            title: '餐饮合计',
            key: 'repastFees',
          }, {
            title: '人员范围',
            key: 'personScope',
            value: '',
          }, {
            title: '会议议程',
            key: 'agenda',
            value: '',
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
        // 重新提交
        if (this.transCode) {
          jsonData.referenceId = this.formData.referenceId;
          jsonData.$review = this.formData.review;
          jsonData.$review2 = this.formData.review2;
        }
        let bseinfo = this.$refs.baseinfo.getFormData();
        jsonData.baseinfo = {
          id: this.guid(),
          transType2: '会务立项申请',
          zhuti: '国富黄金',
          effectiveTime: '',
          transCode: 'KFSCPCGRK',
          statusText: '',
          transType: 'tspcchin',
          status: '',
          comment: '',
          fj: [],
          ...this.baseinfo,
          ...bseinfo,
        };
        // 日期
        jsonData['baseinfoExt#sj'] = {
          id: this.guid(),
          datetime1: formData.begin,
          datetime2: formData.end,
        };
        jsonData['baseinfoExt#me'] = {
          id: this.guid(),
          varchar1: this.assembleDropDownData(formData.province),
          varchar2: this.assembleDropDownData(formData.city),
          varchar3: formData.hotelName,
          integer1: Number(formData.headCount),
          integer2: Number(formData.roomNumber),
          integer3: Number(formData.dayCount),
          double1: Number(formData.roomAveragePrice),
          double3: this.hotelFees, // 住宿合计
          double2: Number(formData.siteFees),
          double4: Number(formData.wayFees),
          double5: Number(formData.repastFees),
          double6: Number(this.totalCost.replace(/￥/g, '').replace(/,/g, '')),
          varchar4: formData.agenda,
          varchar5: formData.personScope
        };
        jsonData['baseinfoExt#fygs'] = {
          id: this.guid(),
          varchar6: this.assembleDropDownData(formData.costBU),
          varchar7: this.assembleDropDownData(formData.costDepartment),
          // $varchar8: this.assembleDropDownData(),
          // $varchar9: this.assembleDropDownData(),
        };
        jsonData['$comment'] = {
          'baseinfo.comment': jsonData.baseinfo.comment
        };
        jsonData['baseinfo.fj'] = this.baseinfo.fj;
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
      assembleDropDownData(value = '') {
        return {
          text: value,
          selection: {
            data: {
              unitName: value,
              id: ''
            }
          },
          value,
        }
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
        }).catch(e => {
          this.showToast(e.message);
        });
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
        }).catch(e => {
          this.showToast(e.message);
        });
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
      // TODO 还原数据
      restoreJsonData(jsonData) {
        console.log(jsonData)
        let {baseinfo} = jsonData;
        let me = {...jsonData['baseinfoExt#me']}
        let sygs = {...jsonData['baseinfoExt#fygs']};
        let sj = {...jsonData['baseinfoExt#sj']};
        let formData = {
          referenceId: jsonData.referenceId,
          province: me.varchar1.value, // 省
          city: me.varchar2.value, // 市
          hotelName: me.varchar3, // 酒店名称
          headCount: me.integer1, // 总人数
          roomNumber: me.integer2, // 房间数量
          dayCount: me.integer3, // 天数
          roomAveragePrice: me.double1, // 房间均价
          siteFees: me.double2, // 会议场地费用
          wayFees: me.double4, // 路费合计
          repastFees: me.double5, // 餐饮合计
          personScope: me.varchar5, // 人员范围
          agenda: me.varchar4, // 会议议程
          begin: sj.datetime1, // 始于
          end: sj.datetime2, // 止于
          costBU: sygs.varchar6 && sygs.varchar6.value,// 费用所属事业部
          costDepartment: sygs.varchar7 && sygs.varchar7.value,// 费用所属部门
          review: jsonData.review || jsonData.$review,
          review2: jsonData.review2 || jsonData.$review2,
        };
        this.baseinfo = baseinfo;

        this.provinceSelected = [formData.province];
        this.citySelected = [formData.city];
        this.cascadeValue = {
          costBU: formData.costBU,
          costDepartment: formData.costDepartment,
        };
        this.formData = formData;
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
      if (!formData && this.transCode) {
        this.showPage = false;
        requestPromises.push(this.getJsonData());
      }

      this.$nextTick(() => {
        // 回写时不请求
        if (!formData && !this.transCode) {
          requestPromises.push(this.$refs.baseinfo.init());
        }
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
  .meeting-container {
    .m_title { //标题
      width: 100%;
      height: 80px;
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
      top: 50px;
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
  }

</style>
