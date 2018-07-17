<template>
  <div class='pages'>
    <div class='content'>
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label>往来编码:</label>
            <input type='text' v-model="AccountCode" class='property_val'/>
          </div>
          <div class='each_property'>
            <label>往来名称:</label>
            <input type='text' v-model="AccountName" class='property_val'/>
          </div>
        </div>
        <div class='mater_pic vux-1px-l'>
          <input type="file" name="file" id='file' @change="uploadFile($event)" accept="image/*" style="display:none;"/>
          <div class='add_icon' v-if='!picShow'>
            <label for="file"></label>
            <div class='upload'>
              <span class='iconfont icon-icon'></span>
              <span class='add_text'>增加图片</span>
            </div>
          </div>
          <div class='add_icon' v-else>
            <label for="file"></label>
            <img :src='MatPic' class='upload'/>
          </div>
        </div>
      </div>
      <r-picker title="往来关系标签:" :data="AccountRelType" value="inventory.processing" v-model="inventory.processing"
                @on-change="natureChange"></r-picker>
      <r-picker title="往来大类:" :data="AccountBigType" value="inventory.inventoryType" v-model="inventory.inventoryType"
                @on-change="bigChange"></r-picker>
      <r-picker title="往来子类:" :data="AccountSmlType" value="inventory.inventorySubclass"
                v-model="inventory.inventorySubclass"></r-picker>
      <!-- <x-address title="省市区" v-model="AccountAddress" :list="addressData"></x-address> -->
      <div class='each_property vux-1px-b'>
        <label></label>
        <div class='picker'>
            <span class='mater_nature'></span>
            <span class='iconfont icon-gengduo'></span>
        </div>
        <x-address title="省市区:"  :list="addressData" id='address'></x-address>
      </div>
      <div class='each_property vux-1px-b'>
        <label>详细地址:</label>
        <input type='text' v-model="inventory.specification" class='property_val'/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>固定电话:</label>
        <input type='text' v-model="inventory.specification" class='property_val'/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>手机:</label>
        <input type='text' v-model="inventory.inventoryColor" class='property_val'/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>电子邮件:</label>
        <input type='text' v-model="inventory.material" class='property_val'/>
      </div>
    </div>
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>
<script>
  import {TransferDom, Picker, Popup, Group, AlertModule,XAddress, ChinaAddressV4Data} from 'vux';
  import RPicker from './../components/RPicker';
  import common from './../mixins/common'
  import dealerService from '../../service/dealerService.js'

  export default {
    data() {
      return {
        picShow: false,
        AccountCode : '',
        AccountName : '',
        AccountRelType : [],
        AccountBigType : [],
        AccountSmlType : [],
        AccountAddress : [],
        AccountPhone : '',
        AccountMail : '',
        PaymentTerm : '',
        PaymentDays : '',
        addressData : ChinaAddressV4Data,
        inventory: {
          inventoryCode: '', // 物料编码
          inventoryName: '', // 物料名称
          processing: '', // 加工属性
          inventoryType: '', // 物料大类
          inventorySubclass: '', // 物料子类
          measureUnit: '', // 主计量单位
          specification: '', // 型号规格
          material: '', // 主材质
          inventoryColor: '', // 颜色
          keepingDays: 1, // 保质期天数
          safeStock: '', // 安全库存
          nearKeepingDays: 1, // 临保天数
          inventoryStatus: '1', // 物料状态
          inventoryPic: '',
          comment: '' // 物料说明
        },

        
      }
    },
    directives: {
      TransferDom
    },
    mixins: [common],
    components: {
      Picker,
      Popup,
      Group,
      RPicker,
      XAddress
    },
    methods: {
      // TODO 加工属性切换
      natureChange(val) {
        let selected = JSON.parse(val);
        // this.getBig(selected.originValue);
      },
      // TODO 材料大类切换
      bigChange(val) {
        let selected = JSON.parse(val);
        // this.getSml(selected.originValue);
      },
      save(){

      }
      
    },
    created() {
      dealerService.getDictByType().then(data=>{
        this.AccountRelType = data.tableContent;
      })
      
    }
  }
</script>
<style lang="scss" scoped> 
  .vux-1px-b:after, .vux-1px-l:before {
    border-color: #e8e8e8;
    color: #e8e8e8;
  }
  .content {
    height: 90%;
    overflow-y: auto;
    input {
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
      padding: 0.05rem 0.08rem;
      position: relative;
      label {
        color: red;
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


