<template>
  <div class='pages'>
    <r-scroll class='content' :options="scrollOptions">
      <div class='mater_baseinfo vux-1px-b'>
          <div class='mater_property'>
            <div class='each_property vux-1px-b'>
              <label class='required'>仓库编码:</label>
              <input type='text' v-model="warehouse.warehouseCode" class='property_val'
                    :class='{readonly :transCode!==""}' :readonly='transCode!==""'/>
            </div>
            <div class='each_property required' :class="transCode != ''?'edit_bor_btm':''">
              <label class='required'>仓库名称:</label>
              <input type='text' v-model="warehouse.warehouseName" class='property_val'/>
            </div>
          </div>
          <upload-image :src="MatPic" @on-upload="onUpload" @on-error="getDefaultImg"></upload-image>
        </div>
        <div v-for="(item,index) in warehouseConfig" :key="index">
          <div v-if="item.fieldCode !== 'staffDealerCode' && item.fieldCode !== 'warehouseProvince'">
            <r-picker :title="`${item.fieldLabel}:`" :data="item.remoteData" :value="item.fieldCode === 'warehouseStatus'? warehouseStatus : warehouse[item.fieldCode]"
                  @on-change="warehouseTypeChange" v-model="item.fieldCode === 'warehouseStatus'? warehouseStatus : warehouse[item.fieldCode]" :required='!item.allowBlank' 
                  v-if="item.xtype === 'r2Combo'" class="r-picker">
            </r-picker>
            <div class='each_property vux-1px-b' v-if="item.xtype === 'r2Textfield'">
              <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}:</label>
              <input type='text' v-model="warehouse[item.fieldCode]" class='property_val'/>
            </div>
          </div>
          <template v-else-if="item.fieldCode === 'warehouseProvince'">
            <div class='each_property vux-1px-b' @click="showAddress = true">
              <label>省市区:</label>
              <div class='picker'>
                  <span class='mater_nature'>{{warehouse.warehouseProvince}}{{warehouse.warehouseCity}}{{warehouse.warehouseDistrict}}</span>
                  <span class='iconfont icon-gengduo'></span>
              </div>
              <x-address title="省市区:"  :list="addressData" @on-hide='getAddress($event)' @on-shadow-change='changeAddress' :value="AccountAddress"
                        :show.sync="showAddress" v-show="false"></x-address>
            </div>
          </template>
          <template v-else>
            <div class='each_property vux-1px-b' @click="showPop = true" v-show="typeSub !== 'noMatched'">
              <label>{{typeSubMap[typeSub].title}}</label>
              <div class='picker'>
                  <span class='mater_nature'>{{typeSubMap[typeSub].value}}</span>
                  <span class='iconfont icon-gengduo'></span>
              </div>
            </div>
          </template>
        </div>
      <!-- <r-picker title="仓库类型:" :data="AccountRelType" :value="warehouse.warehouseType"
                @on-change="warehouseTypeChange" v-model="warehouse.warehouseType" :required='true'>
      </r-picker>
      <div class='each_property vux-1px-b' @click="showPop = true">
        <label>{{typeSubMap[typeSub].title}}</label>
        <div class='picker'>
            <span class='mater_nature'>{{typeSubMap[typeSub].value}}</span>
            <span class='iconfont icon-gengduo'></span>
        </div>
      </div>
      <r-picker title="仓库状态:" :data="statusType" :value="warehouseStatus"
                 v-model="warehouseStatus"></r-picker> -->
    </r-scroll>
    <!--员工，组织，客户等的pop-->
    <pop-warelabe-list :show="showPop" :data="typeSubMap[typeSub].list" v-model="showPop"
                        :defaultValue="typeSubMap[typeSub].value" @sel-group="selGroup" @list-search="getTypeSubList">
    </pop-warelabe-list>
    <div class='vux-1px-t btn '>
      <div class="cfm_btn" @click="save">{{this.transCode ? '保存' : '提交'}}</div>
    </div>
  </div>
</template>
<script>
  import {TransferDom, Picker, Popup, Group, XAddress, ChinaAddressV4Data, Icon, Cell} from 'vux';
  import {getBaseInfoDataBase, getFormConfig, requestData, getFormViews} from 'service/commonService.js';
  import {save, update, getwarehouseInfo, getDepartMentWage} from 'service/warehouseService.js'
  import {getDictByType, getObjDealerByLabelName} from 'service/commonService.js'
  import RPicker from 'components/RPicker';
  import RScroll from 'components/RScroll'
  import common from 'mixins/common.js'
  import UploadImage from 'components/UploadImage'
  import PopWarelabeList from 'components/Popup/PopWarelabelList'
import warehouseDetailVue from './warehouseDetail.vue';
  export default {
    data() {
      return {
        addressData : ChinaAddressV4Data,
        transCode: '',
        picShow: false,
        showPop : false,
        imgFileObj: {}, // 上传的图片对象
        biReferenceId: '',
        MatPic: '', // 图片地址
        AccountRelType: [],
        AccountAddress: [],
        baseinfo: {},
        warehouse: {
          warehouseCode: '', // 仓库编码
          warehouseName: '', // 仓库名称
          warehouseType: '', // 仓库类型
          warehousePic: '', // 图片
          staffDealerCode: null, // 员工
          groupCode: null, // 组织
          customerDealerCode: null, //客户
          processorsDealerCode: '', // 加工商
          channelDealerCode: null, // 渠道商
          warehouseCondtions: '', // 仓储条件
          warehouseProvince: '', // 省
          warehouseCity: '', // 市
          warehouseDistrict: '', // 区
          warehouseAddress: '', // 地址
          warehouseStatus: '', //仓库状态
        },
        submitSuccess: false, // 是否提交成功
        typeSubMap: { // 仓库类型相关二级列表
          staff: {
            title: '员工',
            dealerLabelName: '员工',
            key: 'staffDealerCode',
            value: '',
            code: '',
            list: [], // 员工列表
          },
          group: {
            title: '组织',
            dealerLabelName: '',
            key: 'groupCode',
            value: '',
            code: '',
            list: [], // 组织列表
          },
          customer: {
            title: '客户',
            dealerLabelName: '客户',
            key: 'customerDealerCode',
            value: '',
            code: '',
            list: [], // 客户列表
          },
          processors: {
            title: '加工商',
            dealerLabelName: '加工商',
            key: 'processorsDealerCode',
            value: '',
            code: '',
            list: [], // 加工商列表
          },
          channel: {
            title: '渠道商',
            dealerLabelName: '渠道商',
            key: 'channelDealerCode',
            value: '',
            code: '',
            list: [], // 渠道商列表
          },
          noMatched: {
            title: '',
            dealerLabelName: '',
            key: '',
            value: '',
            code: '',
            list: [],
          },
        },
        typeSub: 'group',
        typeSubValue: '',
        typeToSubMap: {
          '配送中心仓': 'group',
          '加工商仓': 'processors',
          '加工车间仓': 'group',
          '客户仓': 'customer',
          '渠道商仓': 'channel',
          '个人仓': 'staff',
          '一般部门仓': 'group',
        },
        warehouseConfig: [], // 仓库基本信息的配置
        currentGroup:'',
        statusType:[],//仓库状态列表
        warehouseStatus : '使用中',
        showAddress: false,
        scrollOptions: {
          click: true,
        },
      }
    },
    computed:{
      warehouseType(){
        return this.warehouse.warehouseType
      }
    },
    directives: {
      TransferDom
    },
    mixins: [common],
    components: {
      Picker, Popup, Group, RPicker, XAddress, Icon,
      UploadImage, PopWarelabeList, RScroll, Cell
    },
    watch: {
      warehouseType(val){
        // 清空之前的选中值
        this.typeSubMap[this.typeSub].value = '';
        this.typeSubMap[this.typeSub].list = [];
        this.typeSub = this.typeToSubMap[val] || 'noMatched';
        if(this.typeSub === 'noMatched') {
          return
        }
        this.getTypeSubList();
      }
    },
    methods: {
      // TODO 上传图片成功触发
      onUpload(val){
        this.warehouse.warehousePic = val.src;
      },
      //获取仓库类型
      getwarehouse() {
        //获取仓库关系标签
        return getDictByType('warehouseRelType').then(data => {
          //仓库分类无值，请求
          let {tableContent} = data;
          tableContent && tableContent.forEach(item => {
            item.originValue = item.value;
            item.value = item.name;
          });
          this.AccountRelType = tableContent;
          //新增是默认选中对应的关系标签
          if(!this.$route.query.transCode){
            this.warehouse.warehouseType  = this.$route.query.warehouseType ? this.$route.query.warehouseType : tableContent[0].name;
          }
          this.$loading.hide();
        })
      },
      //获取仓库状态
      getStatus(){
        return getDictByType('objStatus').then(data => {
          //仓库分类无值，请求
          let {tableContent} = data;
          tableContent && tableContent.forEach(item => {
            item.originValue = item.name;
            item.value = item.name;
          });
          this.statusType = tableContent;
        })
      },
      //查询仓库信息
      findData() {
        return getwarehouseInfo(this.transCode).then(({formData = {}, attachment = []}) => {
          let {baseinfo = {}, warehouse = {}} = formData;
          switch (warehouse.warehouseStatus) {
            case 1:
              this.warehouseStatus = '使用中';
              break;
            case 2:
              this.warehouseStatus = '未使用';
              break;
            case 0:
              this.warehouseStatus = '草稿';
              break;
            case -1:
              this.warehouseStatus = '停用';
              break;
          }
          this.baseinfo = baseinfo;
          this.warehouse = warehouse;
          this.biReferenceId = this.warehouse.referenceId;
          if (this.warehouse.warehousePic) {
            this.picShow = true;
            this.MatPic = `/H_roleplay-si/ds/download?url=${this.warehouse.warehousePic}&width=400&height=400`;
          } else {
            this.picShow = true;
            this.getDefaultImg()
          }
          this.AccountAddress = [this.warehouse.warehouseProvince, this.warehouse.warehouseCity, this.warehouse.warehouseDistrict]
          for (let item of Object.values(this.typeSubMap)) {
            let code = this.warehouse[item.key];
            if (code) {
              item.code = code;
              // this.warehouse[item.key] = null;
              break;
            }
          }
        });
      },
      // TODO 获取默认图片
      getDefaultImg() {
        this.MatPic = require('assets/ck_default.png');
      },
      //选择地址
      changeAddress(ids, names) {
        this.AccountAddress = names;
      },
      getAddress() {
        if(this.AccountAddress.length>0){
          this.warehouse.warehouseProvince = this.AccountAddress[0];
          // this.$set(this.warehouse, 'province', this.AccountAddress[0])
          this.warehouse.warehouseDistrict = this.AccountAddress[2]
          if(this.AccountAddress[1] === '市辖区'){
            this.warehouse.warehouseCity = '';
            return
          };
          this.warehouse.warehouseCity = this.AccountAddress[1];
        }
        // if (this.AccountAddress.length > 0) {
        //   this.warehouse.province = this.AccountAddress[0];
        //   this.warehouse.city = this.AccountAddress[1];
        //   this.warehouse.county = this.AccountAddress[2]
        // }
      },
      //提交
      submit() {
        for (let key in this.warehouse) {
          if (typeof(this.warehouse[key]) === 'string' && this.warehouse[key].indexOf(' ') >= 0) {
            this.warehouse[key] = this.warehouse[key].replace(/\s/g, '');
          }
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            switch (this.warehouseStatus) {
              case '使用中':
                this.warehouse.warehouseStatus = 1;
                break;
              case '未使用':
                this.warehouse.warehouseStatus = 2;
                break;
              case '草稿':
                this.warehouse.warehouseStatus = 0;
                break;
              case '停用':
                this.warehouse.warehouseStatus = -1;
                break;
            }
            if(this.warehouse.status){
              delete this.warehouse.status;
            }
            let operation = save;
            let submitData = {
              listId: '64a41c48-4e8d-4709-bd01-5d60ad6bc625',
              formData: {
                baseinfo: this.baseinfo,
                warehouse: this.warehouse
              }
            };
            if (this.transCode) {
              operation = update;
            }
            for (let item of Object.values(this.typeSubMap)) {
              if (item.value) {
                let [sel = {}] = item.list.filter(lItem => {
                  return item.value === lItem.value
                });
                this.warehouse[item.key] = sel.code;
                break;
              }
            }
            operation(submitData).then((data = {}) => {
              let {success = false, message = '提交失败'} = data;
              if (success) {
                message = operation === update
                            ? '修改成功'
                            : '提交成功';
                this.submitSuccess = true;
                if (!this.transCode && `${this.$route.query.add}` === '1') {
                  sessionStorage.setItem('EDIT_WAREHOUSE_TRANSCODE', JSON.stringify({transCode: data.transCode}));
                }
              }
              this.$vux.alert.show({
                content: message,
                onHide: () => {
                  if (success) {
                    this.$router.go(-1);
                  }
                }
              });
            });
          }
        })
      },
      save() {
        let warn = '';
        let validateMap = [
          {
            key: 'warehouseCode',
            message: '【仓库编码】',
          }, {
            key: 'warehouseName',
            message: '【仓库名称】',
          }, {
            key: 'warehouseType',
            message: '【仓库类型】',
          },
        ];
        validateMap.every(item => {
          if (this.warehouse[item.key] === '') {
            warn = `${item.message}不能为空`;
            return false
          }
          return true
        });
        if (warn) {
          this.$vux.alert.show({
            content: warn
          });
          return
        }
        this.submit()
      },
      selGroup(val){
        this.typeSubMap[this.typeSub].value = val;
      },
      warehouseTypeChange(val) {
        // if(this.warehouse.warehouseType){
        //   // 清空之前的选中值
        //   this.typeSubMap[this.typeSub].value = '';
        //   this.typeSubMap[this.typeSub].list = [];
        //   this.typeSub = this.typeToSubMap[val] || 'noMatched';
        //   if(this.typeSub === 'noMatched') {
        //     return
        //   }
        //   this.getTypeSubList();
        // }
        
      },
      // TODO 获取仓库类型关联子项下拉列表
      getTypeSubList(val) {
        let filter = [];
        if(val){
          filter = [
            {
              operator: 'like',
              value: val,
              property: 'GROUP_NAME'
            }
          ];
        }
        let currentTypeSub = this.typeSubMap[this.typeSub]; // 当前仓库类型关联子项对象
        switch (this.typeSub) {
          // 请求组织列表
          case 'group':
            return getDepartMentWage({filter: JSON.stringify(filter)}).then(({tableContent = []}) => {
              tableContent.forEach(item => {
                item.name = item.GROUP_NAME;
                item.value = item.GROUP_NAME;
                item.code = item.GROUP_CODE;
                if (item.code === currentTypeSub.code) {
                  this.typeSubMap[this.typeSub].value = item.value;
                }
              });
              this.typeSubMap[this.typeSub].list = tableContent;
              this.typeSubMap[this.typeSub].code = '';
            });
          // 请求员工、客户、加工商、渠道商列表
          case 'staff':
          case 'customer':
          case 'processors':
          case 'channel':
            if(val){
              filter[0].property = 'dealerName';
            }
            return getObjDealerByLabelName({
              dealerLabelName: currentTypeSub.dealerLabelName,
              filter: JSON.stringify(filter)
            }).then(({tableContent = []}) => {
              tableContent.forEach(item => {
                item.name = item.dealerName;
                item.value = item.dealerName;
                item.code = item.dealerCode;
                if (item.code === currentTypeSub.code) {
                  this.typeSubMap[this.typeSub].value = item.value;
                }
              });
              this.typeSubMap[this.typeSub].code = '';
              this.typeSubMap[this.typeSub].list = tableContent;
            });
          default:
            break;
        }
      },
      // 请求应用的viewId
      getFormViews() {
        return getFormViews('64a41c48-4e8d-4709-bd01-5d60ad6bc625').then(data => {
          for(let item of data){
            if(item.viewType === 'submit'){
              this.viewId = item.uniqueId;
              this.getFormConfig();
              break;
            }
          }
        })
      },
      // 获取表单配置
      getFormConfig(){
        getFormConfig(this.viewId).then(({config = []}) => {
          console.log(config);
          let warehouseConfig = [], warehouseMultipleConfig = [];
          config.forEach(item => {
            if(!item.isMultiple) {
              warehouseConfig = JSON.parse(JSON.stringify(item.items));
            }
            else{
              warehouseMultipleConfig.push(item)
            }
          })
          // 仓库基本信息配置的处理
          warehouseConfig.forEach(item =>{
            // 默认显示员工，（渠道商，组织等隐藏）
            if(item.fieldCode === 'groupCode' || item.fieldCode === 'customerDealerCode' || item.fieldCode === 'customerDealerCode' 
              || item.fieldCode === 'processorsDealerCode' || item.fieldCode === 'channelDealerCode'){
              item.hiddenInRun = true
            }
            if(!item.hiddenInRun){
              //下拉框的数据请求
              if(item.fieldCode !== 'warehouseProvince' && item.fieldCode !== 'warehouseCity' && item.fieldCode !== 'warehouseDistrict'){
                if(item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'remoteData') {
                  let url = item.dataSource.data.url;
                  let params = item.dataSource.data.params;
                  let keys = Object.keys(params);
                  let requestParams = {
                    url,
                  }
                  if(keys.length){
                    let data = {};
                    keys.forEach(key => {
                      if(params[key].value.length){

                      }
                      data[key] = params[key].value;
                    })
                    requestParams.data = data;
                  }
                  // console.log(requestParams);
                  requestData(requestParams).then(data => {
                    if(data.tableContent){
                      data.tableContent.forEach(item => {
                        item.value = item.name;
                      })
                      if(item.fieldCode === 'warehouseType'){
                        if(!this.$route.query.transCode){
                          this.warehouse.warehouseType  = this.$route.query.warehouseType ? this.$route.query.warehouseType : data.tableContent[0].value;
                        }
                      }
                      this.$set(item, 'remoteData', data.tableContent)
                    }
                    else{
                      data.forEach(item => {
                        item.value = item.name;
                      })
                      this.$set(item, 'remoteData', data)
                    }
                    
                  })
                }
              }
              // 在渲染的配置中添加字段
              if(item.fieldCode !== 'warehouseCode' && item.fieldCode !== 'warehouseName' && item.fieldCode !== 'warehousePic'
                && item.fieldCode !== 'warehouseCity' && item.fieldCode !== 'warehouseDistrict'){
                this.warehouseConfig.push(item);
              }
            }
          })
          this.$loading.hide()
        })
      },
      addMoreUnit(item){
        let obj = {}
        item.items.forEach(sItem => {
          if(!sItem.hidden){
            obj[sItem.fieldCode] = ''
          }
          
        })
        this.warehouseRelData[item.name].push(obj)
      }
    },
    beforeRouteLeave(to, from, next) {
      let {path} = to;
      // 新建物料，修改列表页的meta值
      if (this.submitSuccess && path === '/warehouse') {
        to.meta.reload = true;
      }
      next();
    },
    created() {
      this.$loading.show();
      let query = this.$route.query;
      if (query.transCode) {
        this.transCode = query.transCode;
        (async () => {
          await this.getFormViews()
          await this.findData();
          // await this.getwarehouse();
          // this.getStatus();
          this.hasDefault = false;
        })();
        return
      }
      this.getFormViews();
      //获取当前用户信息
      getBaseInfoDataBase().then(data => {
        this.baseinfo = {
          ...this.baseinfo,
          ...data
        }
      });
      this.$nextTick(() => {
        if (this.$refs.bScroll) {
          this.$refs.bScroll.refresh();
        }
      })
      // this.getwarehouse();
      // this.getStatus();
    },
    beforeRouteEnter (to, from, next) {
      // 修改title
      to.meta.title = '新增仓库';
      if(to.query.transCode){
        to.meta.title = '编辑仓库';
      }
      next();
    }
  }
</script>
<style lang="scss" scoped>
  .vux-1px-l:before,
  .vux-1px-b:after,
  .vux-1px-t:before  {
    border-color: #e8e8e8;
    left: 0;
  }

  .content {
    height: 90%;
    background-color: #fff;
    overflow: hidden;
    position: relative;
    /deep/ .weui-cells {
      font-size: .12rem;
      margin-top: .1rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 0.1rem;
        &:before {
          // left: 0;
          border-color: #e8e8e8;
          left: 0.1rem;
        }
      }
    }
    // .vux-1px-b:after {
    //   transform: scaleY(1);
    // }
    input {
      border: none;
      outline: none;
    }
    .mater_baseinfo {
      display: flex;
      align-items: flex-end;
      // background-color: #fff;
      .mater_property {
        flex: 1;
      }
    }

    .each_property {
      min-height: .5rem;
      padding: 0.05rem 0.08rem;
      position: relative;
      // background-color: #fff;
      label {
        color: #6d6d6d;
        font-size: 0.12rem;
        display: block;
        height: 0.2rem;
        line-height: 0.2rem;
      }
      .required {
        color: #5077aa;
        font-weight: bold;
      }
      //校验错误提示按钮
      .warn {
        position: absolute;
        right: 0.08rem;
        top: 0.27rem;
      }
      .weui-icon-warn {
        font-size: 0.18rem;
      }
      .property_val {
        display: block;
        font-size: 0.16rem;
        line-height: 0.24rem;
        width: 100%;
      }
      .readonly {
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
      .vux-cell-box {
        position: absolute;
        left: 0;
        top: 0;
        padding: 0.05rem 0.08rem;
        width: 100%;
        box-sizing: border-box;
        color: #6d6d6d;
        font-size: 0.12rem;
        label {
          height: 0.58rem;
        }
        .vux-cell-primary {
          display: none;
        }
        &:not(:first-child):before {
          border: none;
        }

      }
    }
    .upload-image-container {
      width: 1.2rem;
      height: 1.2rem;
    }
  }

  .edit_r_picker {
    padding: 0;
    .vux-1px-b {
      padding: 0 0.08rem !important;
      &:after {
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
  .each-duplicate{
    // border-top: 0.1rem solid #f8f8f8;
  }
   /* 重复项 */
    .duplicate-item {
      margin-top: 0.1rem;
      background-color: #fff;
      overflow: hidden;
      .has_border {
        border-bottom: .03rem solid #e8e8e8;
      }
      /deep/ .weui-cells__title {
        /*padding-left: 0;*/
        font-size: .12rem;
      }
      // /deep/ .weui-cell__hd {
      //   font-size: .16rem;
      // }
      // /deep/ .weui-cells {
      //   &:before, &:after {
      //     display: none;
      //   }
      // }
      /deep/ .weui-cell {
        &:before {
          display: block;
        }
      }
    }
    .duplicate-item-no-select {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: .1rem;
      padding: .1rem .2rem .1rem .1rem;
      background-color: #fff;
      font-size: .16rem;
      .add {
        padding: .01rem .06rem;
        border-radius: .12rem;
        background: #5077aa;
        color: #fff;
        font-size: .12rem;
      }
    }
    .add_more {
      width: 100%;
      text-align: center;
      font-size: 0.12rem;
      padding: 0.1rem 0;
      color: #757575;
      span {
        margin: 0 5px;
        color: #fff;
        padding: .01rem .06rem;
        border-radius: .12rem;
      }
      .add {
        background: #5077aa;
      }
      .delete {
        background: red;
      }
      em {
        font-style: normal;
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

  .edit_bor_btm:after {
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


