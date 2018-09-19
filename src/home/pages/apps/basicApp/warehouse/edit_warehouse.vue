<template>
  <div class='childPage'>
    <div class='content'>
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
      <r-picker title="仓库类型:" :data="AccountRelType" :value="warehouse.warehouseType"
                @on-change="warehouseTypeChange" v-model="warehouse.warehouseType" :required='true'>
      </r-picker>
      <r-picker :title="`${typeSubMap[typeSub].title}:`" :data="typeSubMap[typeSub].list"
                :value="typeSubMap[typeSub].value"
                v-model="typeSubMap[typeSub].value" :required='true' v-show="typeSubMap[typeSub].title">
      </r-picker>
    </div>
    <div class='vux-1px-t btn '>
      <div class="cfm_btn" @click="save" v-html="this.$route.query.add?'保存并使用':'提交'"></div>
    </div>
  </div>
</template>
<script>
  import {TransferDom, Picker, Popup, Group, XAddress, ChinaAddressV4Data, Icon} from 'vux';
  import {getBaseInfoDataBase} from 'service/commonService.js';
  import {save, update, getwarehouseInfo, getDepartMentWage} from 'service/warehouseService.js'
  import {getDictByType, getObjDealerByLabelName} from 'service/commonService.js'
  import RPicker from 'components/RPicker';
  import common from 'mixins/common.js'
  import UploadImage from 'components/UploadImage'

  export default {
    data() {
      return {
        transCode: '',
        picShow: false,
        imgFileObj: {}, // 上传的图片对象
        biReferenceId: '',
        MatPic: '', // 图片地址
        AccountRelType: [],
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
          warehouseStatus: '1', //仓库状态
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
        }
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
      Icon,
      UploadImage,
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
          this.warehouse.warehouseType  = this.$route.query.warehouseType ? this.$route.query.warehouseType : tableContent[0].name;
          this.$loading.hide();
        })
      },
      //查询仓库信息
      findData() {
        return getwarehouseInfo(this.transCode).then(({formData = {}, attachment = []}) => {
          let {baseinfo = {}, warehouse = {}} = formData;
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
          for (let item of Object.values(this.typeSubMap)) {
            let code = this.warehouse[item.key];
            if (code) {
              item.code = code;
              this.warehouse[item.key] = null;
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
        if (this.AccountAddress.length > 0) {
          this.warehouse.province = this.AccountAddress[0];
          this.warehouse.city = this.AccountAddress[1];
          this.warehouse.county = this.AccountAddress[2]
        }
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
                message = '仓库提交成功';
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
      warehouseTypeChange(val) {
        // 清空之前的选中值
        this.typeSubMap[this.typeSub].value = '';
        this.typeSubMap[this.typeSub].code = '';
        this.typeSub = this.typeToSubMap[val] || 'noMatched';
        if(this.typeSub === 'noMatched') {
          return
        }
        this.getTypeSubList();
      },
      // TODO 获取仓库类型关联子项下拉列表
      getTypeSubList() {
        let currentTypeSub = this.typeSubMap[this.typeSub]; // 当前仓库类型关联子项对象
        if (!!currentTypeSub.list.length) {
          this.typeSubMap[this.typeSub].value = currentTypeSub.list[0].value;
          return
        }
        switch (this.typeSub) {
          // 请求组织列表
          case 'group':
            return getDepartMentWage().then(({tableContent = []}) => {
              tableContent.forEach(item => {
                item.name = item.GROUP_NAME;
                item.value = item.GROUP_NAME;
                item.code = item.GROUP_CODE;
                if (item.code === currentTypeSub.code) {
                  this.typeSubMap[this.typeSub].value = item.value;
                }
              });
              this.typeSubMap[this.typeSub].list = tableContent;
              if (currentTypeSub.code === '') {
                this.typeSubMap[this.typeSub].value = tableContent[0].value;
              }
            });
          // 请求员工、客户、加工商、渠道商列表
          case 'staff':
          case 'customer':
          case 'processors':
          case 'channel':
            return getObjDealerByLabelName({
              dealerLabelName: currentTypeSub.dealerLabelName
            }).then(({tableContent = []}) => {
              tableContent.forEach(item => {
                item.name = item.dealerName;
                item.value = item.dealerName;
                item.code = item.dealerCode;
                if (item.code === currentTypeSub.code) {
                  this.typeSubMap[this.typeSub].value = item.value;
                }
              });
              this.typeSubMap[this.typeSub].list = tableContent;
              if (currentTypeSub.code === '') {
                this.typeSubMap[this.typeSub].value = tableContent[0].value;
              }
            });
          default:
            break;
        }
      },
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
      this.$loading.show();
      let query = this.$route.query;
      if (query.transCode) {
        this.transCode = query.transCode;
        (async () => {
          await this.findData();
          await this.getwarehouse();
          this.hasDefault = false;
        })();
        return
      }
      //获取当前用户信息
      getBaseInfoDataBase().then(data => {
        this.baseinfo = {
          ...this.baseinfo,
          ...data,
          // activeTime: this.changeDate(new Date(), true),
        }
      });
      this.getwarehouse();
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
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }

  .content {
    height: 90%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    .vux-1px-b:after {
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
    }

    .each_property {
      min-height: .5rem;
      padding: 0.05rem 0.08rem;
      position: relative;
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


