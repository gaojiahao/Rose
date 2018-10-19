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
      <matter-item class="vux-1px-b" :item="dataInfo"></matter-item>
    </div>
    <!--物料不重要的信息-->
    <!-- <div class="info-container">
      <div class='info_name'>
        <div class='each_info vux-1px-b'>
          <div class="main-content">
            <div class="content-unit">
              <span class="symbol" v-if="dataInfo['标准供货单价'] || dataInfo['标准供货单价'] === 0">标准供货单价：￥ {{dataInfo['标准供货单价'] | toFixed |numberComma(3)}}</span>
            </div>
            <div class="content-name">
              <span class="symbol" v-if="dataInfo['供货单价'] || dataInfo['供货单价'] === 0">供货单价 ：￥{{dataInfo['供货单价'] | toFixed |numberComma(3)}}</span>
            </div>
          </div>
          <div class="number-part">
            <span class="main-number" v-if="dataInfo['供货金额'] || dataInfo['供货金额'] === 0">供货金额：￥{{dataInfo['供货金额'] | toFixed |numberComma(3)}}</span>
          </div>
        </div>  
        <div class='each_info'>
          <div class="main-content">
            <div class="content-unit">
              <span class="symbol" v-if="dataInfo['标准零售单价'] || dataInfo['标准零售单价'] === 0">标准零售单价 ：￥{{dataInfo['标准零售单价'] | toFixed |numberComma(3)}}</span>
            </div>
            <div class="content-name">
              <span class="symbol" v-if="dataInfo['零售单价'] || dataInfo['零售单价'] === 0">零售单价：￥{{dataInfo['零售单价'] | toFixed |numberComma(3)}} </span>         
            </div>
          </div>
          <div class="number-part">
            <span class="main-number" v-if="dataInfo['零售金额'] || dataInfo['零售金额'] === 0">零售金额 ：￥{{dataInfo['零售金额'] | toFixed |numberComma(3)}}</span> 
          </div>
        </div>       
      </div>
    </div> -->
    <div class="amt-container">
      <div class="amt-item vux-1px-b" v-for="(item, index) in amtList" :key="index"
           v-if="dataInfo[item.value] || dataInfo[item.value] === 0">
        <div class="title">{{item.name}}</div>
        <div class="content">{{item.unit}}{{dataInfo[item.value]}}</div>
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
            name: '材质',
            value: 'MATERIAL',
          }, {
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
          }, {
            name: '税价合计',
            value: '税价合计',
            unit: '￥',
          }, {
            name: '每克销售单价',
            value: '每克销售单价',
            unit: '￥',
          },
        ],
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
    }
    .amt-container {
      background-color: #fff;
      .amt-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: .08rem .1rem;
        font-size: .12rem;
        font-weight: bold;
        word-break: break-all;
      }
    }
  }
</style>