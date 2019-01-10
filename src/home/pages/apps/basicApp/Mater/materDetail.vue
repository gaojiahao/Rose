<template>
  <div class="childPage" :class="{'no-edit': !action.update}">
    <r-scroll class="main_content" ref="bScroll">
      <div class="inventory_baseinfo has_margin">
        <div class="baseInfo_top">
          <div class="baseinfo_part">
            <img :src='inventory.inventoryPic' @error="getDefaultImg"/>
            <div class="inventory_name">
              <p class="name">{{inventory.inventoryName}}</p>
              <p class="code">物料编码：<span class="symbol"></span>{{inventory.inventoryCode}}</p>
            </div>
          </div>
          <span class="inventory_status vux-1px" :class="{'no_use' : inventory.status !== '使用中'}">{{inventory.status}}</span>
        </div>
      </div>
      <div class="inventory_other has_margin">
        <div class="each_property" :class="{'vux-1px-b': index < matterConfig.length-1 }" v-for="(item,index) in matterConfig" :key="index">
          <label>{{item.fieldLabel}}:</label>
          <div class='property_val'>{{inventory[item.fieldCode] || "无"}}</div>
        </div>
      </div>
      <div class="common_style d_main" v-for="(cItem, cIndex) in matterDuplicateConfig" :key="`${cIndex}${cItem.name}`" v-if="cItem.show">
        <!-- <div class='title vux-1px-b'>{{cItem.title}}</div> -->
        <div class='content' v-for="(item, index) in formData[cItem.name]" :key="index" v-if="formData[cItem.name].length">
          <div class="each_property vux-1px-b"  v-for="(sItem, sIndex) in cItem.items" :key="sIndex">
            <label>{{sItem.text}}:</label>
            <div class='property_val'>{{item[sItem.fieldCode] || "无"}}</div>
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
      <!-- 物料图片展示区域 -->
      <!-- <div class="d_top">
        <div class="mater_info">
          <img class="avatar" :src="inventory.inventoryPic" alt="materImg" @error="getDefaultImg">
          <span class="mater_name">{{inventory.inventoryName}}</span>
          <div class="mater_status_part">
            <span class="mater_code">{{inventory.inventoryCode}}</span>
            <span class="mater_status" :class="inventory.statusClass">{{inventory.status}}</span>
          </div>
        </div>
      </div>
      <div class="d_main">
        <form-cell cellTitle="创建者" :cellContent="baseinfo.creatorName" :showTopBorder="false"></form-cell>
        <form-cell cellTitle="创建时间" :cellContent="baseinfo.crtTime | dateFormat"></form-cell>
        <form-cell v-if="baseinfo.modiferName" cellTitle="修改者" :cellContent="baseinfo.modiferName"></form-cell>
        <form-cell v-if="baseinfo.modTime" cellTitle="修改时间" :cellContent="baseinfo.modTime | dateFormat"></form-cell>
      </div> -->
      <!-- 物料基本信息展示区域 -->
      <!-- <div class="d_main">
        <div class='title vux-1px-b'>基本信息</div>
        <div class='content'>
          <form-cell v-for="(item, index) in matterConfig" :key="index"
            :cellTitle="item.fieldLabel" :cellContent="inventory[item.fieldCode]" :showTopBorder="index === 0 ? false : true">
          </form-cell>
        </div>
      </div> -->
      <!-- 辅计单位-->
      <!-- <div class="d_main" v-for="(cItem, cIndex) in matterDuplicateConfig" :key="`${cIndex}${cItem.name}`" v-if="cItem.show">
        <div class='title vux-1px-b'>{{cItem.title}}</div>
        <div class='content' :class="{'show_border' : index < formData[cItem.name].length-1 }" v-for="(item, index) in formData[cItem.name]" :key="index" v-if="formData[cItem.name].length">
          <form-cell :cellTitle='sItem.text' :cellContent="item[sItem.fieldCode]"  :showTopBorder="sIndex > 0"
                v-for="(sItem, sIndex) in cItem.items" :key="sIndex" v-if="!sItem.hidden">
          </form-cell>
        </div>
      </div> -->
    </r-scroll>
    <!-- 修改按钮 -->
    <div class="btn vux-1px-t" v-if="action.update">
      <div class="cfm_btn" @click="goEdit">修改</div>
    </div>
  </div>
</template>

<script>
import { AlertModule, dateFormat } from 'vux';
import { findData } from 'service/materService'
import { getAppDetail } from 'service/appSettingService'
import { getFormConfig, getFormViews } from 'service/commonService.js'
import RScroll from 'components/RScroll'
export default {
  name: 'materDetail',
  filters: {
    dateFormat
  },
  data() {
    return {
      listId: '78a798f8-0f3a-4646-aa8b-d5bb1fada28c',
      baseinfo: {},
      transCode: '',
      inventory: {},
      invMoreUnit: [],
      invNetWeight: [],
      invDealerRel: [],
      invCustomerRel: [],
      action: {}, // 表单允许的操作
      matterConfig: [],
      matterDuplicateConfig: [], // 物料重复项的配置
      formData: {}
    }
  },
  computed: {
    // 加工/采购提前期标题
    leadTimeTitle() {
      let processing = this.inventory.processing;
      let pur = ['原料', '商品']; // 采购
      let mac = ['半成品', '成品', '模具']; // 加工
      if (pur.includes(processing)) {
        return '采购提前期'
      } else if (mac.includes(processing)) {
        return '加工提前期'
      } else {
        return ''
      }
    },
  },
  components: {
    RScroll,
  },
  methods: {
    // TODO 跳转到修改页面
    goEdit() {
      this.$router.push({
        path: '/materlist/addMater',
        query: {
          transCode: this.transCode
        }
      })
    },
    // TODO 获取物料详情
    findData() {
      return findData(this.transCode).then(({formData}) => {
        this.formData = formData;
        this.matterDuplicateConfig.forEach(item => {
          if(this.formData[item.name] && !this.formData[item.name].length){
            item.show = false;
            return
          }
          item.show = true;
        })
        let {inventory = {}} = formData;
        let status = ['', '使用中', '未使用', '草稿'],
          statusClass = ['', 'inUse', 'unUse'];
        inventory.statusClass = statusClass[inventory.inventoryStatus];
        inventory.status = status[inventory.inventoryStatus] || '停用';
        this.baseinfo = formData.baseinfo;
        this.inventory = formData.inventory;
        this.invNetWeight = formData.invNetWeight;
        this.invMoreUnit = formData.invMoreUnit;
        this.invDealerRel = formData.invDealerRel || [];
        this.invCustomerRel = formData.invCustomerRel || [];
        let {inventoryPic, inventoryCode, specification} = this.inventory;
        // 获取规格和编码的字符串总长度
        this.contentLength = inventoryCode.length + specification.length;
        // 处理图片
        if (inventoryPic) {
          this.inventory.inventoryPic = `/H_roleplay-si/ds/download?url=${inventoryPic}&width=400&height=400`
        } else {
          this.getDefaultImg();
        }
        this.$loading.hide();
      }).catch(e => {
        this.$loading.hide();
        AlertModule.show({
          content: e.message,
        })
      });
    },
    // TODO 获取默认图片
    getDefaultImg() {
      this.inventory.inventoryPic = require('assets/wl_default03.png');
    },
    // TODO 获取应用详情
    getAppDetail() {
      return getAppDetail(this.listId).then(([data = {}]) => {
        let {action} = data;
        this.action = action;
      })
    },
    // 请求应用的viewId
    getFormViews() {
      return getFormViews(this.listId).then(data => {
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
        let matterConfig = [], matterDuplicateConfig = [];
        config.forEach(item => {
          if(!item.isMultiple) {
            matterConfig = JSON.parse(JSON.stringify(item.items));
          }
          else{
            if(!item.hiddenInRun && item.xtype !== 'r2Fileupload' && item.name === 'invMoreUnit'){
              matterDuplicateConfig.push(JSON.parse(JSON.stringify(item)))
            }
          }
        })
        // 仓库基本信息配置的处理
        matterConfig.forEach(item =>{
          if(!item.hiddenInRun){
            // 在渲染的配置中添加字段
            if(item.fieldCode !== 'inventoryCode' && item.fieldCode !== 'inventoryName' && item.fieldCode !== 'inventoryPic'
              && item.fieldCode !== 'inventoryStatus'){
              this.matterConfig.push(item);
            }
          }
        })
        matterDuplicateConfig.forEach(item => {
          switch(item.name){
            case 'invMoreUnit':
              item.title = '辅助计量';
              break;
            case 'invNetWeight':
              item.title = '净含量';
              break;
            case 'invDealerRel':
              item.title = '客户';
              break;
            case 'invCustomerRel':
              item.title = '供应商';
              break;
          }
        })
        this.matterDuplicateConfig = matterDuplicateConfig;
      })
    },
  },
  created() {
    (async () => {
      this.$loading.show();
      let {transCode = ''} = this.$route.query;
      this.transCode = transCode;
      await this.getAppDetail();
      await this.getFormViews();
      this.findData();
    })()
  }
}
</script>

<style lang='scss' scoped>
  .no-edit {
    .main_content {
      height: 100%;
    }
  }
  .main_content {
    background-color: #F6F6F6;
    overflow: hidden;
    height: 90%;
    box-sizing: border-box;
    padding-bottom: .1rem;
    color: #696969;
    font-size: .14rem;
  }

  // 下划线
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }

  // 下划线
  .vux-1px-r:after {
    border-color: #e8e8e8;
  }
  .common_style {
    margin-bottom: .1rem;
    background: #fff;
    padding: 0 .15rem;
  }
  .inventory_baseinfo {
    @extend .common_style;
    padding: .12rem .15rem .18rem;
    // 仓库名，编码，图片，状态
    .baseInfo_top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      .baseinfo_part {
        display: flex;
        align-items: flex-start;
        img {
          width: .6rem;
          height: .6rem;
          border-radius: .04rem;
          margin-right: .12rem;
        }
        .inventory_name {
          margin-top: .02rem;
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
      .inventory_status {
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
  .inventory_other {
    @extend .common_style;
  }
  .creator {
    @extend .common_style;
    margin-bottom: 0;
  }
  // 中部
  .d_main {
    margin-top: 0.1rem;
    background: #fff;
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

  // 相关应用
  .relevant_list {
    width: 90%;
    margin: 0 auto;
    .each_app {
      margin-bottom: .1rem;
      position: relative;
      border-radius: .08rem;
      .app_info {
        padding: .1rem;
        box-sizing: border-box;
        .title {
          color: #4F90F9;
          font-size: .12rem;
          font-weight: bold;
        }
        .app_name {
          font-size: .18rem;
          .msg_count {
            float: right;
            margin-right: .1rem;
          }
        }
        .msg_num {
          color: #3f72af;
          font-size: .2rem;
          .msg_tx {
            // color: #757575;
            font-size: .12rem;
          }
        }
        .r_arrow {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translate(0, -50%);
        }
      }
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

  // 上划线
  .vux-1px-t:before {
    border-color: #e8e8e8;
  }
</style>
