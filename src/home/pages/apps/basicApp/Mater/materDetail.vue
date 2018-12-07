<template>
  <div class="childPage" :class="{'no-edit': !action.update}">
    <div class="main_content">
      <!-- 物料图片展示区域 -->
      <div class="d_top">
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
      </div>
      <!-- 物料基本信息展示区域 -->
      <div class="d_main">
        <div class='title vux-1px-b'>基本信息</div>
        <div class='content'>
          <form-cell cellTitle="物料大类" :cellContent="inventory.inventoryType" :showTopBorder="false"></form-cell>
          <form-cell cellTitle="物料子类" :cellContent="inventory.inventorySubclass"></form-cell>
          <form-cell cellTitle="规格" :cellContent="inventory.specification"></form-cell>
          <form-cell cellTitle="加工属性" :cellContent="inventory.processing"></form-cell>
          <form-cell cellTitle="材质" :cellContent="inventory.material"></form-cell>
          <form-cell cellTitle="颜色" :cellContent="inventory.inventoryColor"></form-cell>
          <form-cell cellTitle="单位" :cellContent="inventory.measureUnit"></form-cell>
          <form-cell cellTitle="保质期天数" :cellContent="inventory.keepingDays"></form-cell>
          <form-cell cellTitle="临保天数" :cellContent="inventory.nearKeepingDays"></form-cell>
          <form-cell cellTitle="安全库存" :cellContent="inventory.safeStock"></form-cell>
          <form-cell cellTitle="工艺路线名称" :cellContent="inventory.technicsName"></form-cell>
          <form-cell :cellTitle="leadTimeTitle" :cellContent="inventory.leadTime" v-if="leadTimeTitle"></form-cell>
          <form-cell cellTitle="工序名称" :cellContent="inventory.procedureName"></form-cell>
          <form-cell cellTitle="工序编码" :cellContent="inventory.procedureCode"></form-cell>
          <form-cell cellTitle="起订量" :cellContent="inventory.moq"></form-cell>
        </div>
      </div>
      <!-- 辅助计量单位-->
      <div class="d_main" v-show="invMoreUnit.length">
        <div class='title vux-1px-b'>辅助计量单位</div>
        <div class='content' :class="{'show_border' : index>0}" v-for="(item,index) in invMoreUnit" :key="index">
          <form-cell cellTitle='辅助计量单位' :cellContent="item.invSubUnitName" :showTopBorder=false></form-cell>
          <form-cell cellTitle='单位倍数' :cellContent="item.invSubUnitMulti"></form-cell>
          <form-cell cellTitle='辅计说明' :cellContent="item.comment"></form-cell>
        </div>
      </div>
      <div class="d_main" v-show="invNetWeight.length">
        <div class='title vux-1px-b'>净含量</div>
        <div class='content' :class="{'hide_border' : index<1}" v-for="(item,index) in invNetWeight" :key="index">
          <form-cell cellTitle='净含量名称' :cellContent="item.invCompName" :showTopBorder=false></form-cell>
          <form-cell cellTitle='计量单位' :cellContent="item.invCompUnit"></form-cell>
          <form-cell cellTitle='净含量数量' :cellContent="item.invCompQty"></form-cell>
          <form-cell cellTitle='净含量说明说明' :cellContent="item.comment"></form-cell>
        </div>
      </div>
      <div class="d_main" v-show="invDealerRel.length">
        <div class='title vux-1px-b'>客户</div>
        <div class='content' :class="{'hide_border' : index<1}" v-for="(item,index) in invDealerRel" :key="index">
          <form-cell cellTitle='客户名称' :cellContent="item.productDealerName" :showTopBorder=false></form-cell>
          <form-cell cellTitle='客户编码' :cellContent="item.productDealerCode"></form-cell>
          <form-cell cellTitle='客户成品编码' :cellContent="item.clientInventoryCode"></form-cell>
          <form-cell cellTitle='客户成品名称' :cellContent="item.clientInventoryName"></form-cell>
          <form-cell cellTitle='说明' :cellContent="item.productComment"></form-cell>
        </div>
      </div>
      <div class="d_main" v-show="invCustomerRel.length">
        <div class='title vux-1px-b'>供应商</div>
        <div class='content' :class="{'hide_border' : index<1}" v-for="(item,index) in invCustomerRel" :key="index">
          <form-cell cellTitle='供应商名称' :cellContent="item.productDealerName" :showTopBorder=false></form-cell>
          <form-cell cellTitle='供应商编码' :cellContent="item.productDealerCode"></form-cell>
          <form-cell cellTitle='说明' :cellContent="item.productComment"></form-cell>
        </div>
      </div>
    </div>
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
import FormCell from 'components/detail/commonPart/FormCell'
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
    FormCell,
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
      this.inventory.inventoryPic = require('assets/wl_default02.png');
    },
    // TODO 获取应用详情
    getAppDetail() {
      return getAppDetail(this.listId).then(([data = {}]) => {
        let {action} = data;
        this.action = action;
      })
    },
  },
  created() {
    (async () => {
      this.$loading.show();
      let {transCode = ''} = this.$route.query;
      this.transCode = transCode;
      await this.getAppDetail();
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
    background-color: #f8f8f8;
    overflow: auto;
    height: 90%;
    -webkit-overflow-scrolling: touch;
  }

  // 下划线
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }

  // 下划线
  .vux-1px-r:after {
    border-color: #e8e8e8;
  }

  // 顶部
  .d_top {
    display: flex;
    height: 1.6rem;
    line-height: .24rem;
    background: #FFF;
    text-align: center;
    align-items: center;
    justify-content: center;
    .mater_info {
      display: flex;
      align-items: center;
      flex-direction: column;
      .avatar {
        width: .8rem;
        height: .8rem;
        margin: .1rem 0;
      }
      .mater_name {
        font-size: .18rem;
        font-weight: bold;
      }
      .mater_status_part {
        font-size: 0;
        .mater_status,
        .mater_code {
          font-size: .12rem;
          font-weight: bold;
          border-radius: .1rem;
          padding: .01rem .04rem;
        }
        .mater_status {
          color: #FFF;
          background: #474a56;
          margin: 0 .08rem;
          &.inUse {
            background: #53d397;
          }
          &.unUse {
            background: #c7b198;
          }
        }
        .mater_code {
          color: #333;
          background: #b1cbfa;
          &.shortTerm {
            color: #FFF;
            background: #5c636e;
          }
          &.longTerm {

          }
        }
      }
    }

  }

  // 中部
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
