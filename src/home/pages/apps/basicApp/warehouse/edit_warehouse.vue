<template>
  <div class='childPage'>
    <div class='content'>
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class='required'>仓库编码:</label>
            <input type='text' v-model="warehouse.warehouseCode" class='property_val' :class='{readonly :transCode!==""}' :readonly ='transCode!==""'/>
          </div>
          <div class='each_property required' :class="transCode != ''?'edit_bor_btm':''">
            <label class='required'>仓库名称:</label>
            <input type='text' v-model="warehouse.warehouseName" class='property_val'/>
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
      <r-picker title="仓库类型:" :data="AccountRelType" value="warehouse.warehouseType"  
                v-model="warehouse.warehouseType" :required='true'>
      </r-picker>
    </div>
    <div class='vux-1px-t btn '>
      <div class="cfm_btn" @click="save"  v-html="this.$route.query.add?'保存并使用':'提交'"></div>
    </div>
  </div>
</template>
<script>
import { TransferDom, Picker, Popup, Group, XAddress, ChinaAddressV4Data,Icon } from 'vux';
import { upload } from 'service/materService.js';
import { getBaseInfoData } from 'service/commonService.js';
import warehouseService from 'service/warehouseService.js'
import RPicker from 'components/RPicker';
import common from 'mixins/common.js'
export default {
  data() {
    return {
      transCode  : '',
      picShow: false,
      imgFileObj: {}, // 上传的图片对象
      biReferenceId : '',
      MatPic: '', // 图片地址
      AccountRelType : [],
      baseinfo: {
        handler: '', // 经办人ID
        handlerName: '', // 经办人
        handlerArea: '', // 所属区域ID
        handlerAreaName: '', // 所属区域
        handlerUnit: '', // 经办组织ID
        handlerUnitName: '', // 经办部门
        handlerRole: '', // 经办角色ID
        handlerRoleName: '', // 经办角色
        activeTime: '', // 业务发生时间
        comment: '' // 注释
      },
      warehouse: {
        customerDealerCode:null, //客户
        warehouseCode: '', // 仓库编码
        warehouseName: '', // 仓库名称
        warehouseType: '', // 仓库类型
        warehouseStatus: '1', //仓库状态
        warehouseRelType : '',//仓库关系类型
        warehouseSubclass: '', // 仓库子类
        province  : '',  //省
        city: '',  //市
        county: '',  //区
        address: '',  //地址
        warehousePhone: '', //联系电话
        warehouseMobilePhone: '',  //手机
        warehouseMail: '',  //电子邮件
        paymentTerm: '',  //结算方式
        warehouseLogisticsTerms: '', //物流条款
        pamentDays: '',  //账期天数
        comment: '',  //仓库说明
        warehousePic : '',
          // comment:"说明改",
          // warehouseAddress:"",
          // warehouseCity:"",
          // warehouseCode:"仓库编码",
          // warehouseCondtions:"冷藏",
          // warehouseDistrict:"",
          // warehouseName:"仓库名称改",
          // warehouseProvince:"",
          // warehouseRelType:"部门仓",
          // warehouseStatus:"1",
          // warehouseSubclass:"计量设备仓",
          // warehouseType:"设备仓库"
      },
      submitSuccess: false, // 是否提交成功


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
    XAddress,
    Icon
  },
  methods: {
    preloadFile(file) {
      let reader = new FileReader();
      reader.onload = (evt) => {
        this.MatPic = evt.target.result;
      };
      reader.readAsDataURL(file);
    },
    uploadFile(e) {
      let file = e.target.files[0];
      upload({file}).then(res => {
        let {success = false, message = '上传失败', data} = res;
        let [detail = {}] = data;
        this.picShow = true;
        this.preloadFile(file);
        this.warehouse.warehousePic = `/H_roleplay-si/ds/download?url=${detail.attacthment}`;
        // this.biReferenceId = detail.biReferenceId
      }).catch(e => {
        this.$vux.alert.show({
          content: e.message,
        })
      });
    },
    //获取仓库类型
    getwarehouse(){
      //获取仓库关系标签
      return warehouseService.getwarehouseClassfiy().then(data=>{
        //仓库分类无值，请求
        let {tableContent} = data;
        tableContent && tableContent.forEach(item => {
          item.originValue = item.value;
          item.value = item.name;
        });
        this.AccountRelType = tableContent;
        if(this.warehouse.warehouseRelType === ""){
          this.warehouse.warehouseType = tableContent[0].name
        }
        
      })
    },
    //获取客户信息用于提交
    getDealer(){
      warehouseService.getDealer().then(({tableContent=[]})=>{
        this.warehouse.customerDealerCode = tableContent[0].dealerCode        
      })
    },
    //查询仓库信息
    findData() {
      return warehouseService.getwarehouseInfo(this.transCode).then(({formData = {}, attachment = []}) => {
        let {baseinfo = {}, warehouse = {}} = formData;
        // this.baseinfo = {...this.baseinfo, ...baseinfo,};
        // this.warehouse = {...this.warehouse, ...warehouse,};
        this.baseinfo = baseinfo;
        this.warehouse = warehouse;
        this.biReferenceId = this.warehouse.referenceId;
        if (this.warehouse.warehousePic.length>0) {
          this.picShow = true;
          this.MatPic = this.warehouse.warehousePic;
        }
        else{
          this.picShow = true;
          this.getDefaultImg()
        }
        let [imgFileObj = {}] = attachment.filter(item => {
          return item.attacthment === this.warehouse.warehousePic
        });
        this.imgFileObj = imgFileObj;
      });
    },
    // TODO 获取默认图片
    getDefaultImg() {
        this.MatPic = require('assets/dealer.png');
    },
    //选择地址
    changeAddress(ids,names){
      this.AccountAddress = names;
    },
    getAddress(){
      if(this.AccountAddress.length>0){
        this.warehouse.province = this.AccountAddress[0];
        this.warehouse.city = this.AccountAddress[1];
        this.warehouse.county = this.AccountAddress[2]
      }
    },
    //提交
    submit(){
      console.log(this.warehouse);
      for(let key in this.warehouse){
        if(typeof(this.warehouse[key]) === 'string' && this.warehouse[key].indexOf(' ')>=0){
          this.warehouse[key] = this.warehouse[key].replace(/\s/g,'');
        }
      }
      this.$vux.confirm.show({
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          let submitData = {
            listId: '64a41c48-4e8d-4709-bd01-5d60ad6bc625',
            formData: {
              baseinfo: this.baseinfo,
              warehouse: this.warehouse
            }
          };
          if(this.transCode.length>0){//修改
            warehouseService.update(submitData).then(data=>{
              let that = this;
              if(data.success){
                that.submitSuccess  = true;
                this.$vux.alert.show({
                  content: data.message,
                  onHide(){
                    that.$router.go(-1);
                  }
                })
              }
              else{
                this.$vux.alert.show({
                  content: data.message
                })
              }
            })
          }
          else{//新增
            warehouseService.save(submitData).then(data=>{
              let that = this;
              if(data.success){
                that.submitSuccess  = true;
                this.$vux.alert.show({
                  content:data.message,
                  onHide(){
                    if(that.$route.query.add == 1){
                      sessionStorage.setItem('EDIT_WAREHOUSE_TRANSCODE',JSON.stringify({transCode:data.transCode}));
                    }
                    that.$router.go(-1);
                  }
                })
              }
              else{
                this.$vux.alert.show({
                  content:data.message
                })
              }
            })
          }

        }
      })
    },
    save(){
        if(this.warehouse.warehouseCode === ''){
          this.$vux.alert.show({
            content: '【仓库编码】不能为空',
          })
        }
        else if(this.warehouse.warehouseName === ''){
          this.$vux.alert.show({
            content: '【仓库名称】不能为空',
          })
        }
        else if(this.warehouse.warehouseType === ''){
          this.$vux.alert.show({
            content: '【仓库类型】不能为空',
          })
        }
        else{
          this.submit()
        }

      
    }


  },
  beforeRouteLeave(to, from, next) {
    let {path} = to;
    // 新建物料，修改列表页的meta值
    console.log(this.submitSuccess);
    if (this.submitSuccess && path === '/warehouse') {
      to.meta.reload = true;
    }
    next();
  },
  created() {
    let query = this.$route.query;
    if(query.transCode){
      this.transCode = query.transCode;
      (async () => {
        await this.findData();
        await this.getwarehouse();
        this.hasDefault = false;
      })();
      return
    }
    //获取当前用户信息
    getBaseInfoData().then(data => {
      this.baseinfo = {
        ...this.baseinfo,
        ...data,
        activeTime: this.changeDate(new Date(), true),
      }
    });
    this.getwarehouse();   
    this.getDealer();   
  }
}
</script>
<style lang="scss">
  .content {
    height: 90%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    .vux-1px-b:after{
      transform: scaleY(1);
    }
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
      .required{
        color:red;
        font-weight: bold;
      }
      //校验错误提示按钮
      .warn{
        position: absolute;
        right: 0.08rem;
        top: 0.27rem;
      }
      .weui-icon-warn{
        font-size:0.18rem;
      }
      .property_val {
        display: block;
        font-size: 0.16rem;
        line-height: 0.24rem;
        width:100%;
      }
      .readonly{
        color: #999;
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
  .edit_r_picker{
    padding: 0 ;
    .vux-1px-b{
      padding: 0 0.08rem!important;
      &:after{
        border-bottom: none;
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
    position: absolute;
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
  .edit_bor_btm:after{
    content: " ";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    border-top: 1px solid #C7C7C7;
    transform-origin: 0 100%;
    transform: scaleY(0.5);
  }
</style>


