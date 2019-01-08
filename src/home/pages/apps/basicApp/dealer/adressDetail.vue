<template>
  <div class='childPage'>
    <r-scroll class='detail_content' ref="bScroll">
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label>往来编码:</label>
            <div class='property_val'>{{dealer.dealerCode}}</div>
          </div>
          <div class='each_property'>
            <label>往来名称:</label>
            <div class='property_val'>{{dealer.dealerName}}</div>
          </div>
        </div>
        <div class='mater_pic vux-1px-l'>
          <div class='add_icon'>
            <label for="file"></label>
            <img :src='MatPic' class='upload' @error="getDefaultImg"/>
          </div>
        </div>
      </div>
      <div class='each_property vux-1px-b' v-for="(item, index) in dealerConfig" :key="index">
        <template v-if="item.fieldCode === 'province'">
          <label>省市区:</label>
          <div class='property_val'>
            {{dealer.province}}{{dealer.city}}{{dealer.county}}
          </div>
        </template>
        <template v-else>
          <label>{{item.fieldLabel}}:</label>
          <div class='property_val'>{{dealer[item.fieldCode]}}</div>
        </template>
      </div>
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
    </r-scroll>
    
  </div>
</template>
<script>
import { dateFormat } from 'vux'
import dealerService from 'service/dealerService.js'
import { getFormConfig, getFormViews } from 'service/commonService.js'
import RScroll from 'components/RScroll'
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
      dealerConfig: []
    }
  },
  components: {
    RScroll
  },
  methods: {
    //往来信息
    findData() {
      return dealerService.getDealerInfo(this.transCode).then(({formData = {}, attachment = []}) => {
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
        this.MatPic = require('assets/contact_default02.png');
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
        let dealerConfig = [];
        config.forEach(item => {
          if(!item.isMultiple) {
            dealerConfig = JSON.parse(JSON.stringify(item.items));
          }
        })
        // 仓库基本信息配置的处理
        dealerConfig.forEach(item =>{
          if(!item.hiddenInRun){
            // 在渲染的配置中添加字段
            if(item.fieldCode !== 'dealerCode' && item.fieldCode !== 'dealerName' && item.fieldCode !== 'dealerPic'
              && item.fieldCode !== 'city' && item.fieldCode !== 'county'){
              this.dealerConfig.push(item);
            }
          }
        })
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
    div {
      border: none;
      outline: none;
    }
    .mater_baseinfo {
      display: flex;
      align-items: flex-end;
      .mater_property {
        flex: 1;
      }
      .mater_pic {
        .add_icon {
          position: relative;
          label {
            display: block;
            width: 1.2rem;
            height: 1.2rem;
          }
          .upload {
            width: 1.2rem;
            height: 1.2rem;
            position: absolute;
            left: 0;
            top: 0;
            z-index: -999;
            span {
              display: block;
              text-align: center;
            }
            .iconfont {
              font-size: 0.24rem;
              margin-top: 0.24rem;
            }
          }

        }

        .pic {
          width: 1.2rem;
          height: 1.2rem;
          border: 0;
        }
      }
    }
    .each_property {
      min-height: .5rem;
      padding: 0.05rem 0.08rem;
      position: relative;
      label {
        color: #6d6d6d;
        font-size: 0.12rem;
        display: block;
        height:0.2rem;
        line-height: 0.2rem;
      }
      .property_val {
        display: block;
        font-size: 0.16rem;
        line-height: 0.24rem;
      }
      .picker {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .mater_nature {
          font-size: 0.16rem;
          line-height: 0.2rem;
        }
        .iconfont {
          font-size: 0.24rem;
        }
      }
      .vux-cell-box{
        position: absolute;
        left:0;
        top:0;
        padding: 0.05rem 0.08rem;
        width:100%;
        box-sizing: border-box;
        color: #6d6d6d;
        font-size: 0.12rem;
        label{
          height:0.58rem;
        }
        .vux-cell-primary{
          display: none;
        }
        &:not(:first-child):before{
          border:none;
        }

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


