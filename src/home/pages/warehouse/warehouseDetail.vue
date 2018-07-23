<template>
  <div class='childPage'>
    <div class='detail_content'>
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label>仓库编码:</label>
            <div class='property_val'>{{warehouse.warehouseCode}}</div>
          </div>
          <div class='each_property'>
            <label>仓库名称:</label>
            <div class='property_val'>{{warehouse.warehouseName}}</div>
          </div>
        </div>
        <div class='mater_pic vux-1px-l'>
          <div class='add_icon'>
            <label for="file"></label>
            <img :src='MatPic' class='upload' alt="materImg" @error="getDefaultImg"/>
          </div>
        </div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>仓库关系标签:</label>
        <div class='property_val'>{{warehouse.warehouseRelType}}</div>
      </div>
      <!-- <div class='each_property vux-1px-b'>
        <label>仓库大类:</label>
        <div class='property_val'>{{warehouse.warehouseType || '无'}} </div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>仓库子类:</label>
        <div class='property_val'>{{warehouse.warehouseSubclass || '无'}} </div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>省市区:</label>
        <div class='property_val'>
           {{warehouse.warehouseProvince}}{{warehouse.warehouseCity}}{{warehouse.warehouseDistrict}}
        </div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>详细地址:</label>
        <div class='property_val'>{{warehouse.warehouseAddress}}</div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>说明:</label>
        <div class='property_val'>{{warehouse.comment}}</div>
      </div> -->
    </div>
  </div>
</template>
<script>
  //import warehouseService from '../../service/warehouseService.js'
  import warehouseService from '../../service/warehouseService.js'
  export default {
    data() {
      return {
        transCode  : '',
        MatPic: '', // 图片地址   
        imgFileObj: {}, // 上传的图片对象  
        warehouse : {},
        baseinfo :{} 
      }
    },
    methods: {
      //仓库信息
      findData() {
        return warehouseService.getwarehouseInfo(this.transCode).then(({formData = {}, attachment = []}) => {
          let {baseinfo = {}, warehouse = {}} = formData;
          this.hasDefault = true;
          this.baseinfo = {...this.baseinfo, ...baseinfo,};
          this.warehouse = {...this.warehouse, ...warehouse,};
          for(let key in this.warehouse){
            if(this.warehouse[key] == ''){
              this.warehouse[key] = '无'
            }
          }
          this.biReferenceId = this.warehouse.referenceId;
          if (this.warehouse.warehousePic) {
            this.MatPic = this.warehouse.warehousePic;
          }
          else{
            this.getDefaultImg()
          }
          let [imgFileObj = {}] = attachment.filter(item => {
            return item.attacthment === this.warehouse.warehousePic
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
         this.MatPic = require('./../../assets/dealer.png');
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
<style lang="scss"> 
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


