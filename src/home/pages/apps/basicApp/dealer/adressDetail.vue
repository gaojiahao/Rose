<template>
  <div class='childPage'>
    <r-scroll class='detail_content' ref="bScroll">
      <div class="dealer_baseinfo has_margin">
        <div class="baseInfo_top">
          <div class="baseinfo_part">
            <img :src='MatPic' @error="getDefaultImg"/>
            <div class="dealer_name">
              <p class="name">{{dealer.dealerName}}</p>
              <p class="code">往来编码：<span class="symbol"></span>{{dealer.dealerCode}}</p>
            </div>
          </div>
          <span class="dealer_status vux-1px" :class="{'no_use' : dealer.dealerStatus !== '使用中'}">{{dealer.dealerStatus}}</span>
        </div>
        <div class="baseinfo_address">
          <span class="icon-address"></span>
          <span class="address" v-if="dealer.province || dealer.city || dealer.county || dealer.address">
            {{dealer.province}}{{dealer.city}}{{dealer.county}}{{dealer.address}}
          </span>
          <span class="address" v-else>暂无地址</span>
        </div>
      </div>
      <div class="dealer_other">
        <div class="each_property" :class="{'vux-1px-b': index < dealerConfig.length-1 }" v-for="(item,index) in dealerConfig" :key="index">
          <label>{{item.fieldLabel}}:</label>
          <div class='property_val'>{{dealer[item.fieldCode] || "无"}}</div>
        </div>
      </div>
      <!-- <div class="common_style"> -->
        <div class="d_main common_style" v-for="(cItem, cIndex) in dealerDuplicateConfig" :key="`${cIndex}${cItem.name}`" v-if="cItem.show">
          <!-- <div class='title vux-1px-b'>{{cItem.title}}</div> -->
          <div class='content' v-for="(item, index) in formData[cItem.name]" :key="index" v-if="formData[cItem.name].length">
            <div class="each_property vux-1px-b" v-for="(sItem, sIndex) in cItem.items" :key="sIndex">
              <label>{{sItem.text}}:</label>
              <div class='property_val'>{{item[sItem.fieldCode] || "无"}}</div>
            </div>
          </div>
        </div>
      <!-- </div> -->
      <div class="creator">
        <div class='each_property vux-1px-b'>
          <label>创建者:</label>
          <div class='property_val'>{{baseinfo.creatorName}}</div>
        </div>
        <div class='each_property vux-1px-b'>
          <label>创建时间:</label>
          <div class='property_val'>{{baseinfo.crtTime | dateFormat}}</div>
        </div>
        <div class='each_property vux-1px-b' v-if="baseinfo.modiferName">
          <label>修改者:</label>
          <div class='property_val'>{{baseinfo.modiferName}}</div>
        </div>
        <div class='each_property vux-1px-b' v-if="baseinfo.modTime">
          <label>修改时间:</label>
          <div class='property_val'>{{baseinfo.modTime | dateFormat}}</div>
        </div>
      </div>
    </r-scroll>  
  </div>
</template>
<script>
import { dateFormat } from 'vux'
import dealerService from 'service/dealerService.js'
import { getFormConfig, getFormViews } from 'service/commonService.js'
import RScroll from 'components/RScroll'
import FormCell from 'components/detail/commonPart/FormCell'
export default {
  filters: {
    dateFormat
  },
  data() {
    return {
      transCode  : '',
      MatPic: '', // 图片地址
      imgFileObj: {}, // 上传的图片对象
      dealer : {},
      baseinfo :{},
      dealerConfig: [], // 基本信息配置
      dealerDuplicateConfig: [], // 重复项配置
      formData: {}
    }
  },
  components: {
    RScroll, FormCell
  },
  methods: {
    //往来信息
    findData() {
      return dealerService.getDealerInfo(this.transCode).then(({formData = {}, attachment = []}) => {
        this.formData = formData;
        this.dealerDuplicateConfig.forEach(item => {
          if(this.formData[item.name] && !this.formData[item.name].length){
            item.show = false;
            return
          }
          item.show = true;
        })
        let {baseinfo = {}, dealer = {}} = formData;
        switch (dealer.dealerStatus) {
          case "1":
            dealer.dealerStatus = '使用中';
            break;
          case '2':
            dealer.dealerStatus = '未使用';
            break;
          case '0':
            dealer.dealerStatus = '草稿';
            break;
          case '-1':
            dealer.dealerStatus = '停用';
            break;
        }
        this.hasDefault = true;
        this.baseinfo = {...this.baseinfo, ...baseinfo,};
        this.dealer = {...this.dealer, ...dealer,};
        for(let key in this.dealer){
          if(this.dealer[key] == ''){
            this.dealer[key] = '无'
          }
        }
        this.biReferenceId = this.dealer.referenceId;
        if (this.dealer.dealerPic) {
          this.MatPic = `/H_roleplay-si/ds/download?url=${this.dealer.dealerPic}&width=400&height=400`;
        }
        else{
          this.getDefaultImg()
        }
        let [imgFileObj = {}] = attachment.filter(item => {
          return item.attacthment === this.dealer.dealerPic
        });
        this.imgFileObj = imgFileObj;
      }).catch(e=>{
        this.$loading.hide();
        this.$vux.alert.show({
          content:e.message
        })
      });
    },
    // TODO 获取默认图片
    getDefaultImg() {
      this.MatPic = require('assets/default/dealer.png');
    },
    // 请求应用的viewId
    getFormViews() {
      return getFormViews('c0375170-d537-4f23-8ed0-a79cf75f5b04').then(data => {
        for(let item of data){
          if(item.viewType === 'view'){
            this.getFormConfig(item.uniqueId);
            break;
          }
        }
      })
    },
    // 获取表单配置
    getFormConfig(viewId){
      getFormConfig(viewId).then(({config = []}) => {
        console.log(config);
        let dealerConfig = [],dealerDuplicateConfig = [];
        config.forEach(item => {
          if(!item.isMultiple) {
            dealerConfig = JSON.parse(JSON.stringify(item.items));
          }
          else{
            dealerDuplicateConfig.push(JSON.parse(JSON.stringify(item)))
          }
        })
        //往来基本信息配置的处理
        dealerConfig.forEach(item =>{
          if(!item.hiddenInRun){
            // 在渲染的配置中添加字段
            if(item.fieldCode !== 'dealerCode' && item.fieldCode !== 'dealerName' && item.fieldCode !== 'dealerPic'
              && item.fieldCode !== 'province' && item.fieldCode !== 'city' && item.fieldCode !== 'county'
              && item.fieldCode !== 'address' && item.fieldCode !== 'dealerStatus' ){
              this.dealerConfig.push(item);
            }
          }
        })
        dealerDuplicateConfig.forEach(item => {
          switch(item.name){
            case 'dealerCertificateRel':
              item.title = '证件';
              break;
            case 'deliveryAddresses':
              item.title = '地址';
              break;
          }
        })
        this.dealerDuplicateConfig = dealerDuplicateConfig;
      })
    },
  },
  created() {
    this.$loading.show()
    let query = this.$route.query;
    if(query.transCode){
      this.transCode = query.transCode;
      (async() => {
        await this.getFormViews();
        await this.findData();
        this.$loading.hide()

      })()
    }
  }
}
</script>
<style lang="scss" scoped>
  .vux-1px-l:before,
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }
  .detail_content {
    height: 100%;
    overflow: hidden;
    background: #f8f8f8;
    color: #696969;
    font-size: .14rem;
    div {
      border: none;
      outline: none;
    }
    .common_style{
      margin-bottom: .1rem;
      background: #fff;
      padding: 0 .15rem;
    }
    .dealer_baseinfo {
      @extend .common_style;
      padding: .12rem .15rem .18rem;
      // 仓库名，编码，图片，状态
      .baseInfo_top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        .baseinfo_part {
          display: flex;
          align-items: flex-start;
          img {
            width: .6rem;
            height: .6rem;
            border-radius: .04rem;
            margin-right: .12rem;
          }
          .dealer_name {
            margin-top: .02rem;
            .name{
              font-size: .16rem;
              line-height: .16rem;
              font-weight: bold;
              color: #333;
            }
            .code {
              margin-top: .12rem;
              line-height: .14rem;
              .symbol {
                color: #333;
              }
            }
          }
        }
        .dealer_status {
          font-size: .12rem;
          line-height: .22rem;
          color: #FA7138;
          padding: 0 .05rem;
          &.vux-1px::before {
            border-color: #FA7138;
            border-radius: .04rem;
          }
          &.no_use{
            color: #999;
            &.vux-1px::before {
              border-color: #999;
            }
          }

        }
      }
      // 地址
      .baseinfo_address {
        margin-top: .1rem;
        display: flex;
        align-items: flex-start;
        .icon-address {
          width: .16rem;
          height: .16rem;
          margin: .02rem .08rem 0 0;
        }
        .address{
          flex: 1;
          display: block;
          line-height: .2rem;
        }
      }
    }
    .each_property {
      height: .5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .property_val {
        color: #333;
      }
    }
    .dealer_other {
      @extend .common_style;
    }
    //创建者
    .creator {
      @extend .common_style;
      margin-bottom: 0;
    }
  }
  .d_main {
    // margin-top: 0.1rem;
    // background: #fff;
    .title {
      color: #111;
      background: #fff;
      font-size: .16rem;
      padding: .06rem 0;
      font-weight: bold;
    }
    .content {

      &.show_border {
        border-bottom: .03rem solid #e8e8e8;
      }
    }

  }
  //确认框
  .popup_header {
    display: flex;
    justify-content: space-between;
    height: 44px;
    line-height: 44px;
    font-size: 16px;
    background-color: #fbf9fe;
    padding: 0 15px;
    .cancel {
      color: #828282;
    }
    .confirm {
      color: #FF9900;

    }
  }

  // 确定
  .btn {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 10%;
    position: fixed;
    background: #fff;
    .cfm_btn {
      top: 50%;
      left: 50%;
      width: 2.8rem;
      color: #fff;
      height: .44rem;
      line-height: .44rem;
      position: absolute;
      text-align: center;
      background: #5077aa;
      border-radius: .4rem;
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 5px #5077aa;
    }
  }

</style>


