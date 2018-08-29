<template>
  <div class='childPage'>
    <div class='detail_content'>
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
      <div class='each_property vux-1px-b'>
        <label>往来关系标签:</label>
        <div class='property_val'>{{dealer.dealerLabelName}}</div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>省市区:</label>
        <div class='property_val'>
           {{dealer.province}}{{dealer.city}}{{dealer.county}}
        </div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>详细地址:</label>
        <div class='property_val'>{{dealer.address}}</div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>固定电话:</label>
        <div class='property_val'>{{dealer.dealerPhone}}</div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>手机:</label>
        <div class='property_val'>{{dealer.dealerMobilePhone}}</div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>电子邮件:</label>
        <div class='property_val'>{{dealer.dealerMail}}</div>
      </div>
    </div>
  </div>
</template>
<script>
  import dealerService from 'service/dealerService.js'
  export default {
    data() {
      return {
        transCode  : '',
        MatPic: '', // 图片地址
        imgFileObj: {}, // 上传的图片对象
        dealer : {},
        baseinfo :{}
      }
    },
    methods: {
      //往来信息
      findData() {
        return dealerService.getDealerInfo(this.transCode).then(({formData = {}, attachment = []}) => {
          let {baseinfo = {}, dealer = {}} = formData;
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
          this.$vux.alert.show({
            content:e.message
          })
        });
      },
      // TODO 获取默认图片
      getDefaultImg() {
         this.MatPic = require('assets/contact_default02.png');
      },
    },
    created() {
      let query = this.$route.query;
      if(query.transCode){
        this.transCode = query.transCode;
          this.findData();
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
    overflow-y: auto;
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


