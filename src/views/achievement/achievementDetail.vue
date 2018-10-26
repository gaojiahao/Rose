<template>
  <div class="achievement-detail-container">
    <basic-info :basicInfo="dataInfo"></basic-info>
    <contact-part :contactInfo="dataInfo"></contact-part>
    <warehouse-content :warehouse="dataInfo"></warehouse-content>
    <div class="info-container accounting-container vux-1px-t">
      <div class="title">核算单元</div>
      <div class="info-item"></div>
      <form-cell title="归属银行" :content="dataInfo.HEADQUARTER"></form-cell>
      <form-cell title="核算归属单元" :content="dataInfo.BUSINESS_UNIT"></form-cell>
      <form-cell title="核算归属省份" :content="dataInfo.BUSINESS_PROVINCE"></form-cell>
    </div>
    <!-- 物料列表 -->
    <div class="info-container matter-container">
      <div class="title">
        <span class="iconfont icon-Shape"></span>存货
      </div>
      <matter-item class="":item="dataInfo"></matter-item>
      <div class="get_more" :class="{'arrow_up': showMore}" @click="showMore = !showMore">
        <span>查看更多</span>
        <x-icon type="ios-arrow-down" size="18"></x-icon>
      </div>
    </div>
    <!--物料不重要的信息-->
    <div class="amt-container vux-1px-t" v-show="showMore">
      <div class="amt-item" :class="{'text_right' : index%2 !== 0}"v-for="(item, index) in amtList" :key="index"
           v-if="dataInfo[item.value] || dataInfo[item.value] === 0">
        <!-- <div class="title">{{item.name}}</div>
        <div class="content">{{item.unit}}{{dataInfo[item.value]}}</div> -->
        {{item.name}}：{{item.unit}}{{dataInfo[item.value]}}
      </div>
    </div>
    <div class="info-container other-container">
      <!-- <div class="title">其它</div> -->
      <!-- <form-cell title="故事题材" :content="dataInfo['故事题材']"></form-cell>
      <form-cell title="总行名称" :content="dataInfo['总行名称']"></form-cell>
      <form-cell title="是否开票" :content="dataInfo['是否开票']"></form-cell>
      <form-cell title="开票号" :content="dataInfo['开票号']"></form-cell> -->
      <form-cell title="出库备注" :content="dataInfo.COMMENT"></form-cell>
      <!-- <form-cell title="类别" :content="dataInfo['类别']"></form-cell> -->
    </div>
  </div>
</template>

<script>
  import BasicInfo from 'components/common/BasicInfo'
  import ContactPart from 'components/common/ContactPart'
  import WarehouseContent from 'components/common/WarehouseContent'
  import MatterItem from 'components/common/MatterItem'
  import FormCell from 'components/common/FormCell'
  import {numberComma} from 'vux'
  import {toFixed} from 'plugins/calc'

  export default {
    name: "achievementDetail",
    components: {
      BasicInfo,
      ContactPart,
      WarehouseContent,
      MatterItem,
      FormCell,
    },
    data() {
      return {
        item: {},
        amtList: [
          {
            name:'子类',
            value : 'inventorySubName',

          },
          {
            name:'金标重',
            value : 'AU_STANDARD_WEIGHT',

          },
          {
            name:'银标重',
            value : 'AG_STANDARD_WEIGHT',

          },
          {
            name:'件标重',
            value : 'PIECES_STANDARD_WEIGHT',

          },
          {
            name:'出库重量',
            value : '出库重量',

          },
           {
            name: '标准供货单价',
            value: '标准供货单价',
            unit: '￥',
          }, {
            name: '供货单价',
            value: '供货单价',
            unit: '￥',
          }, {
            name: '供货金额',
            value: '供货金额',
            unit: '￥',
          }, {
            name: '标准零售单价',
            value: '标准零售单价',
            unit: '￥',
          }, {
            name: '零售单价',
            value: '零售单价',
            unit: '￥',
          }, {
            name: '零售金额',
            value: '零售金额',
            unit: '￥',
          }, 
          {
            name: '销售单价',
            value: '销售单价',
            unit: '￥',
          },
          {
            name: '销售金额',
            value: '销售金额',
            unit: '￥',
          },
          {
            name: '销项税额',
            value: '销项税额',
            unit: '￥',
          },
          {
            name: '价税合计',
            value: '价税合计',
            unit: '￥',
          }
        ],
        showMore : false,//显示其余信息
      }
    },
    filters: {
      numberComma,
      toFixed,
    },
    methods: {},
    created() {
      let data = sessionStorage.getItem('RFD_ACHIEVEMENT_DETAIL');
      this.dataInfo = JSON.parse(data);
    }
  }
</script>

<style scoped lang="scss">
  .achievement-detail-container {
    width: 100%;
    height: 100%;
    .vux-1px-t:before,
    .vux-1px-b:after,
    .vux-1px-t:before,
    .vux-1px-tb:before,
    .vux-1px-tb:after {
      border-color: #e8e8e8;
    }
    .info-container {
      padding: .06rem .08rem;
      background-color: #fff;
      &.accounting-container {
        padding: .06rem .3rem;
      }
      &.matter-container {
        margin-top: .1rem;
      }
      &.other-container {
        margin-top: .1rem;
      }
      .title {
        color: #111;
        font-weight: bold;
        font-size: .16rem;
      }
      .info_name {
        font-size: .12rem;
        font-weight: bold;
        word-break: break-all;
        // display: flex;
        // justify-content: space-between;
        .each_info {
          display: flex;
          padding: .06rem 0;
          align-items: center;
          .main-content {
            .content-unit {
              flex: 2;
              color: #757575;
              font-size: .1rem;
              word-break: break-all;
              .icon-bianma {
                font-size: .1rem;
              }
            }
            .content-name {
              font-size: .12rem;
              font-weight: bold;
              word-break: break-all;
            }
          }
          .number-part {
            flex: 1;
            display: flex;
            font-size: .1rem;
            text-align: right;
            flex-direction: column;
            .main-number {
              font-size: .12rem;
              font-weight: bold;
            }
            .number-unit {
              color: #757575;
            }
          }

        }

        span {
          display: block;
        }
        .standard_info {
          color: #757575;
          font-size: .1rem;
          word-break: break-all;
        }

      }
      .each_property {
        color: #757575;
        font-size: .1rem;
        word-break: break-all;
        display: flex;
        justify-content: space-between;

      }
      .get_more{
        display: flex;
        justify-content: center;
        align-items: center;
        color: #757575;
        &.arrow_up{
          .vux-x-icon-ios-arrow-down{
            transform: rotate(-180deg);
          }
        }
      }
    }
    .amt-container {
      background-color: #fff;
      padding: 0 0.1rem;
      // .amt-item {
      //   display: flex;
      //   justify-content: space-between;
      //   align-items: center;
      //   padding: .05rem .1rem;
      //   font-size: .12rem;
      //   font-weight: bold;
      //   word-break: break-all;
      // }
      .amt-item{
        display: inline-block;
        width: 50%;
        box-sizing: border-box;
        padding: 0.05rem 0;
        text-align: left;
        font-size:0.12rem;
        font-weight: 600;
        color:#757575;
        &.text_right{
          text-align: right;
        }
      }
    }
  }
</style>