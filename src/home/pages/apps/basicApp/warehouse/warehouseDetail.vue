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
      <!-- 辅计单位-->
      <div class="d_main" v-for="(cItem, cIndex) in warehouseDuplicateConfig" :key="`${cIndex}${cItem.name}`" v-if="cItem.show">
        <div class='title vux-1px-b'>{{cItem.title}}</div>
        <div class='content' :class="{'show_border' : index < formData[cItem.name].length-1}" v-for="(item, index) in formData[cItem.name]" :key="index" v-if="formData[cItem.name].length">
          <form-cell :cellTitle='sItem.text' :cellContent="item[sItem.fieldCode]" :showTopBorder="sIndex > 0" 
                v-for="(sItem, sIndex) in cItem.items" :key="sIndex">
          </form-cell>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { dateFormat } from 'vux'
import {getwarehouseInfo, getDepartMentWage} from 'service/warehouseService.js'
import {getObjDealerByLabelName, getFormConfig, requestData, getFormViews} from 'service/commonService.js'
import FormCell from 'components/detail/commonPart/FormCell'
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
      warehouseConfig: [], // 仓库基本信息的配置,
      warehouseDuplicateConfig: [], // 物料重复项的配置
      formData: {},
      viewId: ''

    }
  },
  components: {
    FormCell
  },
  methods: {
    //仓库信息
    findData() {
      return getwarehouseInfo(this.transCode).then(({formData = {}, attachment = []}) => {
        this.formData = formData;
        this.warehouseDuplicateConfig.forEach(item => {
          if(this.formData[item.name] && !this.formData[item.name].length){
            item.show = false;
            return
          }
          item.show = true;
        })
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
            this.viewId = item.uniqueId
            break;
          }
        }
      })
    },
    // 获取表单配置
    getFormConfig(){
      getFormConfig(this.viewId).then(({config = []}) => {
        // console.log(config);
        let warehouseConfig = [], warehouseMultipleConfig = [];
        config.forEach(item => {
          if(!item.isMultiple) {
            warehouseConfig = JSON.parse(JSON.stringify(item.items));
          }
          else{
            if(!item.hiddenInRun && item.xtype !== 'r2Fileupload'){
              warehouseMultipleConfig.push(JSON.parse(JSON.stringify(item)))
            }
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
            // 在渲染的配置中添加字段
            if(item.fieldCode !== 'warehouseCode' && item.fieldCode !== 'warehouseName' && item.fieldCode !== 'warehousePic'
              && item.fieldCode !== 'warehouseCity' && item.fieldCode !== 'warehouseDistrict'){
              this.warehouseConfig.push(item);
            }
          }
        })
        warehouseMultipleConfig.forEach(item => {
          switch(item.name){
            case 'warehouseRel':
              item.title = '库位';
              break;
          }
          item.items.forEach((sItem, sIndex) => {
            if(sItem.hidden){
              item.items.splice(sIndex, 1);
              sIndex --;
            }
          })
        })
        this.warehouseDuplicateConfig = warehouseMultipleConfig;
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
        await this.getFormConfig()
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
    background: #f8f8f8;
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
      background: #fff;
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
    .d_main {
      margin-top: 0.1rem;
      background: #fff;
      padding: 0 0.1rem;
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
  }

</style>


