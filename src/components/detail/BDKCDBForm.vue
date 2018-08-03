<template>
  <div class="pages">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <div class="or_ads mg_auto box_sd">
        <div class="title">出库仓库</div>
        <div class="user_info">
          <span class="user_name">{{orderInfo.inPut.warehouseName_containerCodeOut}}</span>
          <span class="user_tel"></span>
        </div>
        <div class="cp_info">
          <p class="cp_name">{{orderInfo.inPut.warehouseAddress_containerCodeOut}}</p>
          <p class="cp_ads"></p>
        </div>
      </div>
      <div class="or_ads mg_auto box_sd">
        <div class="title">入库仓库</div>
        <div class="user_info">
          <span class="user_name">{{orderInfo.inPut.warehouseName_containerCode}}</span>
          <span class="user_tel"></span>
        </div>
        <div class="cp_info">
          <p class="cp_name">{{orderInfo.inPut.warehouseAddress_containerCode}}</p>
          <p class="cp_ads"></p>
        </div>
      </div>
      <div class="trade_mode mg_auto box_sd">
        <p class="title">创建时间</p>
        <p class="mode">{{orderInfo.crtTime || '暂无'}}</p>
      </div>
      <!-- 物料列表 -->
      <div class="materiel_list mg_auto box_sd">
        <div class="title">物料列表</div>
        <div class="mater_list">
          <div class="each_mater vux-1px-b" v-for="(item, index) in orderInfo.inPut.dataSet" :key='index'>
            <div class="each_mater_wrapper">
              <div class="mater_img">
                <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
              </div>
              <div class="mater_main">
                <!-- 物料名称 -->
                <div class="mater_name">
                  {{item.inventoryName_transObjCode}}
                </div>
                <!-- 物料基本信息 -->
                <div class="mater_info">
                  <!-- 物料编码、规格 -->
                  <div class="withColor">
                    <!-- 物料编码 -->
                    <div class="ForInline" style="display:inline-block">
                      <div class="mater_code">
                        <span class="title">编码</span>
                        <span class="num">{{item.transObjCode}}</span>
                      </div>
                    </div>
                    <!-- 物料规格 -->
                    <div class="ForInline" style="display:inline-block">
                      <div class="mater_spec">
                        <span class="title">规格</span>
                        <span class="num">{{item.specification_transObjCode || '无'}}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 物料数量和价格 -->
                <div class='mater_other'>
                  <div class='mater_num'>
                    <span class="num">调拨数量: {{item.tdQty}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 金额合计栏 -->
          <!--<div class="price_list">
            <div class='title'>合计<span style="fontSize:.12rem;">(含税)</span></div>
            <div class="num"><span style="fontSize:.12rem;">￥</span>{{count | numberComma(3)}}</div>
          </div>-->
        </div>
      </div>
      <!-- 审批操作 -->
    </div>
  </div>
</template>

<script>
  import {numberComma, dateFormat} from 'vux'
  import {getSOList,} from 'service/detailService'
  import workFlow from 'components/workFlow'
  import detailCommon from 'components/mixins/detailCommon'

  export default {
    data() {
      return {
        orderInfo: {},      // 表单内容
        formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
        defaulImg: require('assets/avatar.png'),   // 默认图片1
        defaulImg2: require('assets/io.jpg'),       // 默认图片2
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow,
    },
    filters: {
      numberComma
    },
    methods: {
      //选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 获取详情
      getOrderList(transCode = '') {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(data => {
          // http200时提示报错信息
          if (data.success === false) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          // 获取合计
          let {dataSet} = data.formData.inPut;
          for (let val of dataSet) {
            val.inventoryPic = val.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg();
          }
          data.formData.validUntil = dateFormat(data.formData.validUntil, 'YYYY-MM-DD');
          this.orderInfo = data.formData;
          this.workFlowInfoHandler();
        })
      },
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';
</style>
