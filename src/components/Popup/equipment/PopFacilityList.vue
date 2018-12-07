<template>
  <r-popup class="pop-facility-list" :show="showPop" :data="listData" :options="scrollOptions" :has-next="hasNext"
           :default-value="selItems" :judge-keys="judgeKeys" :filter-list="filterList"
           @on-pulling-up="onPullingUp" @on-select="selItem" @on-search="searchList" v-model="showPop" multipart
           ref="RPopup">
    <template slot-scope="{item, index}" slot="pop-item">
      <div class="order-code" v-if="item.transCode">
        <span class="order-title">订单号</span>
        <span class="order-num">{{item.transCode}}</span>
      </div>
      <div class="order-matter">
        <div class="mater_img">
          <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
        </div>
        <div class="mater_main ">
          <!-- 物料名称 -->
          <div class="mater_name">
            <span class="whiNum">No.{{index + 1}}</span>{{item.facilityName}}
          </div>
          <!-- 物料基本信息 -->
          <div class="mater_info">
            <!-- 物料编码、规格 -->
            <div class="withColor">
              <!-- 物料编码 -->
              <div class="ForInline" style="display:inline-block">
                <div class="mater_code">
                  <span class="title">编码</span>
                  <span class="num">{{item.facilityCode}}</span>
                </div>
              </div>
              <!-- 物料规格 -->
              <div class="ForInline" style="display:inline-block">
                <div class="mater_spec">
                  <span class="title">规格</span>
                  <span class="num">{{item.facilitySpecification || '无'}}</span>
                </div>
              </div>
            </div>
            <!-- 物料分类、材质 -->
            <div class="withoutColor">
              <!-- 物料分类 -->
              <div class="mater_classify">
                <span class="father">大类: {{item.facilityBigType || '无'}}</span>
                <span class="child">子类: {{item.facilitySubclass || '无'}}</span>
              </div>
              <div class="mater_classify">
                <span class="father">类型: {{item.facilityType || '无'}}</span>
                <span class="unit">单位: {{item.facilityUnit}}</span>
              </div>
              <slot name="storage" :item="item">
                <div class="mater_classify">
                  <span class="spec">待下单: {{item.qtyBal}}</span>
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </template>
  </r-popup>
</template>

<script>
  import {getObjFacilityByType, getEquipmentPurchaseOrder, getObjFacilityByDealerCode} from 'service/equipmentService'
  import RPopup from 'components/Popup/commonPart/RPopup'

  export default {
    name: "PopFacilityList",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      // 默认值
      defaultValue: {
        type: Array,
        default() {
          return []
        }
      },
      // 请求接口
      request: {
        type: String,
        default: '0'
      },
      // 请求的传参，本地库存调拨请求数据时会传入
      params: {
        type: Object,
        default() {
          return {}
        }
      },
      filterList: {
        type: Array,
        default() {
          return [ // 过滤列表
            {
              name: '设施名称',
              value: 'facilityName',
            }, {
              name: '设施编码',
              value: 'facilityCode',
            },
          ]
        }
      },
      judgeKeys: {
        type: Array,
        default() {
          return ['transCode', 'facilityCode']
        }  
      }
    },
    components: {
      RPopup,
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: [], // 哪些被选中了
        listData: [], // 物料列表
        limit: 100, // 每页条数
        page: 1., // 当前页码
        hasNext: true, // 是否有下一页
        scrollOptions: { // 滚动配置
          pullUpLoad: true,
        },
        filterProperty: '', // 过滤的key
        requestMethods: null,
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        }
      },
      defaultValue: {
        handler(val) {
          this.selItems = [...this.defaultValue];
        },
        immediate: true,
      },
      params: {
        handler() {
          this.resetCondition();
          // 参数改变，重新请求接口
          this.getList();
        }
      }
    },
    methods: {
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 获取物料列表
      getList() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return this.requestMethods({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.params,
        }).then(({dataCount = 0, tableContent = []}) => {
          tableContent.forEach(item => {
            item.inventoryPic = item.inventoryPic ? `/H_roleplay-si/ds/download?url=${item.inventoryPic}&width=400&height=400` : this.getDefaultImg();
          });
          let {relationKey = ''} = this.$route.query;
          if (relationKey) {
            this.selItems = [...tableContent];
            this.$emit('sel-matter', JSON.stringify(this.selItems));
          }
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
        });
      },
      // TODO 搜索物料
      searchList({val = '', property = ''}) {
        this.srhInpTx = val;
        this.filterProperty = property;
        this.resetCondition();
        this.getList();
      },
      // TODO 删除选中项
      delSelItem(dItem) {
        this.$refs.RPopup.delSelItem(dItem);
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getList();
      },
      // TODO 共用的数据处理方法
      // TODO 初始化条件
      resetCondition() {
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
      },
      // TODO 选择设施
      selItem(sItem) {
        this.$emit('sel-matter', JSON.stringify(sItem));
      },
    },
    created() {
      let serviceList = [getObjFacilityByType, getEquipmentPurchaseOrder, getObjFacilityByDealerCode];
      this.requestMethods = serviceList[this.request];
      this.getList();
    }
  }
</script>

<style scoped lang="scss">
  .pop-facility-list {
    .order-code {
      display: flex;
      color: #fff;
      font-size: .12rem;
      span {
        display: inline-block;
        padding: 0 .04rem;
      }
      .order-title {
        background: #455d7a;
      }
      .order-num {
        background: #c93d1b;
      }
    }

    .order-matter {
      display: flex;
      margin-top: .1rem;
    }

    // 物料图片
    .mater_img {
      display: inline-block;
      width: .75rem;
      height: .75rem;
      img {
        width: 100%;
        max-height: 100%;
      }
    }

    // 物料主体
    .mater_main {
      flex: 1;
      padding-left: .1rem;
      box-sizing: border-box;
      display: inline-block;
      // 物料名称
      .mater_name {
        color: #111;
        overflow: hidden;
        font-size: .12rem;
        font-weight: bold;
        max-height: .46rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
        // 每个物料的索引
        .whiNum {
          color: #fff;

          padding: 0 .04rem;
          font-size: .1rem;
          display: inline-block;
          background: #ea5455;
          vertical-align: middle;
          margin: -.02rem .04rem 0 0;
        }
      }
      // 物料信息
      .mater_info {
        color: #757575;
        font-size: .12rem;
        // 有颜色包裹的
        .withColor {
          margin-top: .04rem;
          // 物料编码
          .mater_code {
            display: flex;
            .title,
            .num {
              font-size: .1rem;
              display: inline-block;
              padding: .01rem .04rem;
            }
            .title {
              color: #fff;
              background: #3f72af;
            }
            .num {
              color: #111;
              max-width: .85rem;
              overflow: hidden;
              white-space: nowrap;
              background: #dbe2ef;
              box-sizing: border-box;
              text-overflow: ellipsis;
            }
          }
          // 规格
          .mater_spec {
            @extend .mater_code;
            margin-left: .1rem;
            .title {
              color: #fff;
              background: #537791;
            }
            .num {
              color: #fff;
              max-width: .6rem;
              background: #ff7f50;
            }
          }
        }
        // 没颜色包裹的
        .withoutColor {
          // 物料分类
          .mater_classify {
            font-size: .1rem;
            margin-top: .02rem;
            .type,
            .father {
              margin-right: .04rem;
            }
          }
          // 物料颜色 材质
          .mater_material {
            font-size: .1rem;
            .unit,
            .color {
              margin-right: .06rem;
            }
          }
        }
      }
    }
  }
</style>
