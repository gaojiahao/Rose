<template>
  <div class="detail_wrapper cpxq-detail-container">
    <div class="basicPart">
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="userData" :order-info="userData"></basic-info>
      <div class="product">
        <div class="title">
          <div>
            <span class="iconfont icon-mingxi1"></span>
            <span>招聘信息</span>
          </div>
        </div>
        <form-cell cellTitle="申请部门" :cellContent="userData.applicationDepartment || '无'"></form-cell>
        <form-cell cellTitle="申请岗位" :cellContent="userData.applicationPost || '无'"></form-cell>
        <form-cell cellTitle="招聘人数" :cellContent="userData.recruitmentPeople || '无'"></form-cell>
        <form-cell cellTitle="任职要求" :cellContent="userData.jobRequirements || '无'"></form-cell>
        <form-cell cellTitle="岗位描述" :cellContent="userData.postDescription || '无'"></form-cell>
        <form-cell cellTitle="招聘原因" :cellContent="userData.recruitmentReson || '无'"></form-cell>
        <form-cell cellTitle="备注" :cellContent="userData.biComment || '无'"></form-cell>
      </div>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
    </div>
  </div>
</template>

<script>
// vux 组件引入
import {dateFormat} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
// mixins 引入
import detailCommon from 'mixins/detailCommon'
export default {
  data() {
    return {
      userData: {},      // 表单内容
      formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
      contactInfo: {}, // 客户、付款方式、物流条款的值
      uploadStyle: {
        width: '100%',
        padding :'0.06rem 0.1rem'

      }
    }
  },
  mixins: [detailCommon],
  methods: {
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default03.png');
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
      }).then(({success = true, formData = {}, attachment = []}) => {
        // http200时提示报错信息
        if (success === false) {
          this.$vux.alert.show({
            content: '抱歉，数据有误，暂无法查看',
            onHide: () => {
              this.$router.back();
            }
          });
          return;
        }
        this.attachment = attachment;
        this.userData = formData;
        this.workFlowInfoHandler();
      })
    },
    // 跳转到编辑页面
    goEdit() {
      // 交易号、应用名称等
      let { name,folder, fileName } = this.$route.query;
      this.$router.push({
        path: `/fillform/0/${fileName}`,
        query: {
          name, 
          folder, fileName,
          transCode: this.transCode
        }
      })
    },
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';

  .cpxq-detail-container {
    .product {
      margin-bottom: .1rem;
      padding: 0 .1rem;
      width: 100%;
      background-color: #fff;
      box-sizing: border-box;
      .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: .04rem 0;
        font-size: .16rem;
        font-weight: bold;
        .icon-mingxi1 {
          font-size: .14rem;
        }
      }
      .icon-bianji1 {
        font-size: .14rem;
        font-weight: normal;
      }
    }
  }
</style>
