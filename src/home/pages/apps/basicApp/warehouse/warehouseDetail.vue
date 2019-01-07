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
            <img :src='MatPic' class='upload' @error="getDefaultImg"/>
          </div>
        </div>
      </div>
      <div class='each_property vux-1px-b' v-for="(item,index) in warehouseConfig" :key="index">
        <template v-if="item.fieldCode === 'warehouseProvince'">
          <label>省市区:</label>
          <div class='property_val'>{{warehouse.warehouseProvince}}{{warehouse.warehouseCity}}{{warehouse.warehouseDistrict}}</div>
        </template>
        <template v-else>
          <label>{{item.fieldLabel}}:</label>
          <div class='property_val'>{{warehouse[item.fieldCode] || "无"}}</div>
        </template>
      </div>
      <!-- <div class='each_property vux-1px-b'>
        <label>仓库关系类型:</label>
        <div class='property_val'>{{warehouse.warehouseType}}</div>
      </div>
      <div class='each_property vux-1px-b' v-if="typeSubMap[typeSub].title">
        <label>{{typeSubMap[typeSub].title}}:</label>
        <div class='property_val'>{{typeSubMap[typeSub].value}}</div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>仓库状态:</label>
        <div class='property_val'>{{warehouse.warehouseStatus}}</div>
      </div> -->
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
  </div>
</template>
<script>
import { dateFormat } from 'vux'
import {getwarehouseInfo, getDepartMentWage} from 'service/warehouseService.js'
import {getObjDealerByLabelName, getFormConfig, requestData, getFormViews} from 'service/commonService.js'
import { setTimeout } from 'timers';
export default {
  filters: {
    dateFormat
  },
  data() {
    return {
      transCode: '',
      MatPic: '', // 图片地址
      warehouse: {},
      baseinfo: {},
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

    }
  },
  methods: {
    //仓库信息
    findData() {
      return getwarehouseInfo(this.transCode).then(({formData = {}, attachment = []}) => {
        let {baseinfo = {}, warehouse = {}} = formData;
        switch (warehouse.warehouseStatus) {
          case 1:
            warehouse.warehouseStatus = '使用中';
            break;
          case 2:
            warehouse.warehouseStatus = '未使用';
            break;
          case 0:
            warehouse.warehouseStatus = '草稿';
            break;
          case -1:
            warehouse.warehouseStatus = '停用';
            break;
        }
        this.hasDefault = true;
        this.baseinfo = {...this.baseinfo, ...baseinfo,};
        this.warehouse = {...this.warehouse, ...warehouse,};
        // 设置图片
        if (this.warehouse.warehousePic) {
          this.MatPic = `/H_roleplay-si/ds/download?url=${this.warehouse.warehousePic}&width=400&height=400`;
        } else {
          this.getDefaultImg()
        }

        for (let key in this.warehouse) {
          if (this.warehouse[key] == '') {
            this.warehouse[key] = '无'
          }
        }
        // 展示员工、客户、加工商、渠道商列表
        this.typeSub = this.typeToSubMap[this.warehouse.warehouseType] || 'noMatched';
        if(this.typeSub === 'noMatched') {
          return
        }
        for (let item of Object.values(this.typeSubMap)) {
          if (this.warehouse[item.key]) {
            item.code = this.warehouse[item.key];
            this.getTypeSubList();
            break;
          }
        }
        this.biReferenceId = this.warehouse.referenceId;
        this.$loading.hide();
      }).catch(e => {
        this.$loading.hide();
        this.$vux.alert.show({
          content: e.message
        })
      });
    },
    // TODO 获取默认图片
    getDefaultImg() {
      this.MatPic = require('assets/ck_default.png');
    },
    // TODO 获取仓库类型关联子项下拉列表
    getTypeSubList() {
      switch (this.typeSub) {
        // 请求组织列表
        case 'group':
          return getDepartMentWage().then(({tableContent = []}) => {
            for(let item of tableContent) {
              if(item.GROUP_CODE === this.typeSubMap[this.typeSub].code) {
                this.typeSubMap[this.typeSub].value = item.GROUP_NAME;
                break;
              }
            }
          });
        // 请求员工、客户、加工商、渠道商列表
        case 'staff':
        case 'customer':
        case 'processors':
        case 'channel':
          return getObjDealerByLabelName({
            dealerLabelName: this.typeSubMap[this.typeSub].dealerLabelName
          }).then(({tableContent = []}) => {
            for(let item of tableContent) {
              if(item.dealerCode === this.typeSubMap[this.typeSub].code) {
                this.typeSubMap[this.typeSub].value = item.dealerName;
                break;
              }
            }
          });
        default:
          break;
      }
    },
    // 请求应用的viewId
    getFormViews() {
      return getFormViews('64a41c48-4e8d-4709-bd01-5d60ad6bc625').then(data => {
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
  },
  created() {
    this.$loading.show()
    let query = this.$route.query;
    if (query.transCode) {
      this.transCode = query.transCode;
      (async() => {
        await this.getFormViews();
        await this.findData();
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

  .childPage {
    position: fixed;
    width: 100%;
    height: 100%;
    bottom: 0;
    z-index: 5;
    background: #fff;
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
        height: 0.2rem;
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


