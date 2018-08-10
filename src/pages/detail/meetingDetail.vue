<template>
  <div class="pages meeting-detail-container">
    <div class="swiper-container" v-show="showPage">
      <div class="swiper-wrapper">
        <div class="swiper-slide form">
          <h1 class="m_title">
            会议立项
          </h1>
          <div class="m_main">
            <div class="m_main_part">
              <group :title="lItem.title" v-for="(lItem,lIndex) in listData" :key="lIndex">
                <cell v-for="(item, index) in lItem.items" :title="item.title" :value="item.value" :key="index"
                      primary="content"></cell>
              </group>
              <group title="费用合计">
                <cell title="金额合计" :value="totalCost"></cell>
              </group>
            </div>
          </div>
        </div>
        <flow-detail class="swiper-slide" :trans-code="transCode" :current-user="currentUser"></flow-detail>
      </div>
    </div>
    <div class="m_btm vux-1px-t" v-if="canSubmit" v-show="showPage">
      <span class="m_button reject" @click="showConfirmPop(0)">拒绝</span>
      <span class="m_button" @click="showConfirmPop(1)">同意</span>
    </div>
    <loading :show="showLoading"></loading>
    <task-confirm :show="showConfirm" v-model="showConfirm" :can-empty="result === 1"
                  @on-confirm="confirm"></task-confirm>
  </div>
</template>

<script>
  import detail from './../mixins/detail'
  import {numberComma} from 'vux'

  export default {
    name: "mettingDetail",
    mixins: [detail],
    data() {
      return {
        listData: [
          {
            title: '请填写会议安排明细',
            items: [
              {
                title: '开始日期',
                key: 'begin',
                value: '',
              }, {
                title: '结束日期',
                key: 'end',
                value: '',
              }, {
                title: '省份',
                key: 'province',
                value: '',
              }, {
                title: '城市',
                key: 'city',
                value: '',
              }, {
                title: '酒店名称',
                key: 'hotelName',
                value: '',
              }, {
                title: '房间均价',
                key: 'roomAveragePrice',
                value: '',
              }, {
                title: '房间数量',
                key: 'roomNumber',
                value: '',
              }, {
                title: '总人数',
                key: 'headCount',
                value: '',
              }, {
                title: '场地费用',
                key: 'siteFees',
                value: '',
              }, {
                title: '路费合计',
                key: 'wayFees',
                value: '',
              }, {
                title: '餐饮合计',
                key: 'repastFees',
                value: '',
              }
            ]
          }, {
            title: '请填写会议相关事宜',
            items: [
              {
                title: '人员范围',
                key: 'personScope',
                value: '',
                isTextArea: true
              }, {
                title: '会议议程',
                key: 'agenda',
                value: '',
                isTextArea: true
              }
            ]
          }, {
            title: '费用归属',
            items: [
              {
                title: '费用所属事业部',
                key: 'costBU',
                value: '',
              }, {
                title: '费用所属部门',
                key: 'costDepartment',
                value: '',
              }
            ]
          }
        ],
      }
    },
    computed: {
      totalCost() {
        let {roomNumber = 0, roomAveragePrice = 0, siteFees = 0, wayFees = 0, repastFees = 0} = this.formData;
        return `￥${numberComma(Number(roomNumber) * Number(roomAveragePrice) + Number(siteFees) + Number(wayFees) + Number(repastFees))}`;
      },
    },
    methods: {
      // TODO 展示数据
      restoreJsonData(jsonData) {
        console.log(jsonData)
        let {baseinfoExt} = jsonData;
        let formData = {
          province: baseinfoExt.varchar1.value, // 省
          city: baseinfoExt.varchar2.value, // 市
          hotelName: baseinfoExt.varchar3, // 酒店名称
          headCount: baseinfoExt.integer1, // 总人数
          roomNumber: baseinfoExt.integer2, // 房间数量
          dayCount: baseinfoExt.integer3, // 天数
          roomAveragePrice: baseinfoExt.double1, // 房间均价
          siteFees: baseinfoExt.double2, // 会议场地费用
          wayFees: baseinfoExt.double4, // 路费合计
          repastFees: baseinfoExt.double5, // 餐饮合计
          personScope: baseinfoExt.varchar5, // 人员范围
          agenda: baseinfoExt.varchar4, // 会议议程
          begin: jsonData['baseinfoExt#sj'].datetime1, // 始于
          end: jsonData['baseinfoExt#sj'].datetime2, // 止于
          costBU: jsonData['baseinfoExt#gs'].varchar6.value,// 费用所属事业部
          costDepartment: jsonData['baseinfoExt#gs'].varchar7.value,// 费用所属部门
          comment: jsonData.baseinfo.comment, // 备注
          transCode: jsonData.baseinfo.transCode,
          transType: jsonData.baseinfo.transType,
        };

        this.provinceSelected = [formData.province];
        this.citySelected = [formData.city];
        this.cascadeValue = {
          costBU: formData.costBU,
          costDepartment: formData.costDepartment,
        };
        this.formData = formData;
        this.listData.forEach(lItem => {
          lItem.items.forEach(item => {
            item.value = formData[item.key]
          })
        });
      },
    },
  }
</script>

<style lang="scss" scoped>
  .meeting-detail-container {
    .swiper-container {
      height: 100%;
      .form {
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
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
        &.reject {
          background-color: #ccc;
        }
      }
    }
  }
</style>
