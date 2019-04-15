<template>
  <div class='childPage'>
    <r-scroll class='detail_content' ref="bScroll">
      <div class="warehouse_baseinfo has_margin">
        <div class="baseInfo_top">
          <div class="baseinfo_part">
            <img :src='MatPic' @error="getDefaultImg"/>
            <div class="warehouse_name">
              <p class="name">{{warehouse.warehouseName}}</p>
              <p class="code">仓库编码：<span class="symbol"></span>{{warehouse.warehouseCode}}</p>
            </div>
          </div>
          <span class="warehouse_status vux-1px" :class="{'no_use' : baseinfo.status === '已删除'}">{{baseinfo.status}}</span>
        </div>
        <div class="baseinfo_address">
          <span class="icon-address"></span>
          <span class="address" v-if="warehouse.warehouseProvince || warehouse.warehouseCity || warehouse.warehouseDistrict || warehouse.warehouseAddress">
            {{warehouse.warehouseProvince}}{{warehouse.warehouseCity}}{{warehouse.warehouseDistrict}}{{warehouse.warehouseAddress}}
          </span>
          <span class="address" v-else>暂无地址</span>
        </div>
      </div>
      <div class="warehouse_other has_margin">
        <div v-for="(item, index) in warehouseConfig" :key="index">
          <div class="each_property" :class="{'vux-1px-b': index < warehouseConfig.length-1 }" v-if="!item.hiddenInRun">
            <label>{{item.fieldLabel}}:</label>
            <div class='property_val'>{{warehouse[item.displayField] || warehouse[item.fieldCode] || "无"}}</div>
          </div>
        </div>
      </div>
      <div class="common_style">
        <div v-for="(cItem, cIndex) in warehouseDuplicateConfig" :key="`${cIndex}${cItem.name}`">
          <div class="d_main" v-if="cItem.show">
            <div class='content' v-for="(item, index) in formData[cItem.name]" :key="index">
              <div>
                <div class="each_property vux-1px-b"  v-for="(sItem, sIndex) in cItem.items" :key="sIndex">
                  <label>{{sItem.text}}:</label>
                  <div class='property_val'>{{item[sItem.fieldCode] || "无"}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="creator">
        <div class='each_property vux-1px-b'>
          <label>创建者:</label>
          <div class='property_val'>{{baseinfo.creatorName}}</div>
        </div>
        <div class='each_property vux-1px-b'>
          <label>创建时间:</label>
          <div class='property_val'>{{baseinfo.crtTime | changeDate(true)}}</div>
        </div>
        <div class='each_property vux-1px-b' v-if="baseinfo.modiferName">
          <label>修改者:</label>
          <div class='property_val'>{{baseinfo.modiferName}}</div>
        </div>
        <div class='each_property vux-1px-b' v-if="baseinfo.modTime">
          <label>修改时间:</label>
          <div class='property_val'>{{baseinfo.modTime | changeDate(true)}}</div>
        </div>
      </div>
    </r-scroll>
    <div class="modify_icon" @click="goEdit">
      <span class="icon-edit"></span>
    </div>  
  </div>
</template>
<script>
import { dateFormat } from 'vux'
import {getwarehouseInfo, getDepartMentWage} from 'service/warehouseService'
import {getObjDealerByLabelName, getFormConfig, requestData, getFormViews} from 'service/common/commonService'
import RScroll from 'plugins/scroll/RScroll'
export default {
  filters: {
    dateFormat,
    changeDate(d, hasSecond = false) {
      if (!d) {
        return '';
      }
      if (typeof d === 'string') {
        d = d.replace(/-/g, '/').replace(/\..*/g, '');
      }
      let fmt = 'YYYY-MM-DD';
      if (hasSecond) {
        fmt = 'YYYY-MM-DD HH:mm:ss';
      }
      return dateFormat(d, fmt)
    },
  },
  data() {
    return {
      typeSub: 'group',
      listId: '64a41c48-4e8d-4709-bd01-5d60ad6bc625',
      typeToSubMap: {
        '配送中心仓': 'groupCode',
        '加工商仓': 'processorsDealerCode',
        '加工车间仓': 'groupCode',
        '客户仓': 'customerDealerCode',
        '渠道商仓': 'channelDealerCode',
        '个人仓': 'staffDealerCode',
        '一般部门仓': 'groupCode',
      },
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
      viewId: '',
      MatPic: '', // 图片地址
      transCode: '',
      baseinfo: {},
      formData: {},
      warehouse: {},
      warehouseConfig: [], // 仓库基本信息的配置,
      warehouseDuplicateConfig: [], // 物料重复项的配置
    }
  },
  components: {
    RScroll
  },
  computed: {
    // 仓库类型
    warehouseType(){
      return this.warehouse.warehouseType
    },
  },
  watch: {
    warehouseType: {
      handler(val){
        this.typeSub = this.typeToSubMap[val] || 'noMatched';
        for (let item of this.warehouseConfig){
          if (item.fieldCode === this.typeSub) {
            // 将当前员工编码, 组织编码等找到对应的名称
            if (item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'remoteData') {
              let requestParams = this.handlerParams(item);
              requestData(requestParams).then(({tableContent = []}) => {
                for (let dItem of tableContent){
                  if (dItem[item.valueField] === this.warehouse[item.fieldCode]) {
                    this.$set(this.warehouse, item.displayField, dItem[item.displayField])
                    break;
                  }
                }
              })  
            }
          }
        }
      },
      immediate: true
    },
  },
  methods: {
    // 获取默认图片
    getDefaultImg() {
      this.MatPic = require('assets/default/warehouse.png');
    },
    // 跳转到修改页面
    goEdit() {
      this.$router.push({
        path: '/warehouse/edit_warehouse',
        query: {
          transCode: this.transCode
        }
      })
    },
    // 处理配置中的接口请求
    handlerParams(sItem) {
      let url = sItem.dataSource.data.url;
      let params = sItem.dataSource.data.params;
      let keys = Object.keys(params);
      let requestParams = {
        url,
      }
      if (keys.length) {
        let data = {};
        keys.forEach(key => {
          data[key] = params[key].type === 'text' ? params[key].value : '';
        })
        requestParams.data = data;
      }
      return requestParams
    },
    // 获取 表单基本信息
    async getFormViewInfo() {
      // 获取表单uniqueId
      await getFormViews(this.listId).then(data => {
        for (let item of data){
          if (item.viewType === 'view'){
            this.viewId = item.uniqueId
            break;
          }
        }
      })
      // 获取表单配置
      await getFormConfig(this.viewId).then(({config = []}) => {
        let warehouseConfig = [], warehouseMultipleConfig = [];
        config.forEach(item => {
          if (!item.isMultiple) {
            warehouseConfig = JSON.parse(JSON.stringify(item.items));
          }
          else {
            if (!item.hiddenInRun && item.xtype !== 'r2Fileupload'){
              warehouseMultipleConfig.push(JSON.parse(JSON.stringify(item)))
            }
          }
        })
        // 仓库基本信息配置的处理
        warehouseConfig.forEach(item => {
          // 默认显示员工，（渠道商，组织等隐藏）
          var fieldCodeFilter = ['warehouseCode','warehouseName','warehousePic','warehouseProvince','warehouseCity','warehouseDistrict',
          'warehouseAddress','warehouseStatus']
          if(item.xtype == 'r2Spacer')return;
          if (!item.hiddenInRun){
            // 在渲染的配置中添加字段
            if (fieldCodeFilter.indexOf(item.fieldCode) == -1){
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
          let arr = [];
          item.items.forEach(sItem => {
            if (!sItem.hidden){
              arr.push(sItem)
            }
          })
          item.items = arr;
        })
        this.warehouseDuplicateConfig = warehouseMultipleConfig;
      })
    },
    // 获取组织并将id转换成对应的中文名
    // getDepart() {
    //   return getDepartMentWage().then(({ tableContent }) => {
    //     for (let item of tableContent) {
    //       if (item['GROUP_CODE'] === this.warehouse['groupCode']) {
    //         this.$set(this.warehouse, 'groupCode', item.GROUP_NAME)
    //       }
    //     }
    //   })
    // },
    //仓库信息
    async findData() {
      await getwarehouseInfo(this.transCode).then(({formData = {}, attachment = []}) => {
        this.formData = formData;
        this.warehouseDuplicateConfig.forEach(item => {
          if (this.formData[item.name] && !this.formData[item.name].length){
            item.show = false;
            return
          }
          item.show = true;
        })
        let {baseinfo = {}, warehouse = {}} = formData;
        switch (baseinfo.status) {
          case 1:
            baseinfo.status = '已生效';
            break;
          case 2:
            baseinfo.status = '进行中';
            break;
          case 0:
            baseinfo.status = '草稿';
            break;
          case -1:
            baseinfo.status = '已失效';
            break;
          case -2:
            baseinfo.status = '已删除';
            break;
          case -3:
            baseinfo.status = '已归档';
            break;          
        }
        this.hasDefault = true;
        this.baseinfo = baseinfo;  
        this.warehouse = warehouse;      
        this.typeSub = this.typeToSubMap[this.warehouse.warehouseType]
        for (let item of this.warehouseConfig){
          console.log(item);
          if (item.fieldCode === this.typeSub){
            item.hiddenInRun = false;
          }
          else {
            if (item.fieldCode === 'staffDealerCode' || item.fieldCode === 'groupCode' || item.fieldCode === 'customerDealerCode' || item.fieldCode === 'customerDealerCode' 
              || item.fieldCode === 'processorsDealerCode' || item.fieldCode === 'channelDealerCode'){
                item.hiddenInRun = true
              }
            
          }
        }
        // 设置图片
        if (this.warehouse.warehousePic) {
          this.MatPic = `/H_roleplay-si/ds/download?url=${this.warehouse.warehousePic}&width=400&height=400`;
        } else {
          this.getDefaultImg()
        }
        this.biReferenceId = this.warehouse.referenceId;
        this.$loading.hide();  
      });
      // 获取组织并将id转换成对应的中文名
      // await this.getDepart();
    }
  },
  created() {
    this.$loading.show()
    let query = this.$route.query;
    if (query.transCode) {
      this.transCode = query.transCode;
      (async() => {
        await this.getFormViewInfo();
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
    background: #F6F6F6;
  }
  // 修改按钮
  .modify_icon {
    position: absolute;
    right: .15rem;
    bottom: 10%;
    width: .3rem;
    height: .3rem;
    z-index: 100;
    span{
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  .detail_content {
    height: 100%;
    overflow: hidden;
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
    .warehouse_baseinfo {
      @extend .common_style;
      padding: .12rem .15rem .18rem;
      // 仓库名，编码，图片，状态
      .baseInfo_top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .baseinfo_part {
          display: flex;
          align-items: center;
          img {
            width: .6rem;
            height: .6rem;
            border-radius: .04rem;
            margin-right: .12rem;
          }
          .warehouse_name {
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
        .warehouse_status {
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
    .warehouse_other {
      @extend .common_style;
    }
    .d_main {
      margin-top: 0.1rem;
      background: #fff;
      // padding: 0 0.1rem;
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
    //创建者
    .creator {
      @extend .common_style;
      margin-bottom: 0;
    }
  }

</style>


