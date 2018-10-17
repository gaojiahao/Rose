<template>
  <div class="achievement-detail-container">
    <basic-info :basicInfo="dataInfo"></basic-info>
    <div class="info-container">
      <div class="title">核算单元</div>
      <div class="info-item"></div>
      <form-cell title="归属银行" :content="dataInfo.HEADQUARTER"></form-cell>
      <form-cell title="核算归属单元" :content="dataInfo.BUSINESS_UNIT"></form-cell>
      <form-cell title="核算归属省份" :content="dataInfo.BUSINESS_PROVINCE"></form-cell>
    </div>
    <contact-part :contactInfo="dataInfo"></contact-part>
    <warehouse-content :warehouse="dataInfo"></warehouse-content>

    <!-- 物料列表 -->
    <div class="info-container">
      <div class="title">
        <span class="iconfont icon-Shape"></span>存货
      </div>
      <matter-item class="vux-1px-b" :item="dataInfo"></matter-item>
    </div>

    <div class="info-container">
      <div class="title">其它</div>
      <form-cell title="故事题材" :content="dataInfo['故事题材']"></form-cell>
      <form-cell title="总行名称" :content="dataInfo['总行名称']"></form-cell>
      <form-cell title="是否开票" :content="dataInfo['是否开票']"></form-cell>
      <form-cell title="开票号" :content="dataInfo['开票号']"></form-cell>
      <form-cell title="出库备注" :content="dataInfo.COMMENT"></form-cell>
      <form-cell title="类别" :content="dataInfo['类别']"></form-cell>
    </div>
  </div>
</template>

<script>
  import BasicInfo from './common/BasicInfo'
  import ContactPart from './common/ContactPart'
  import WarehouseContent from './common/WarehouseContent'
  import MatterItem from './common/MatterItem'
  import FormCell from './common/FormCell'

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
      }
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
    .info-container {
      margin-top: .1rem;
      padding: .06rem .08rem;
      background-color: #fff;
      .title {
        color: #111;
        font-weight: bold;
        font-size: .16rem;
      }
    }
  }
</style>