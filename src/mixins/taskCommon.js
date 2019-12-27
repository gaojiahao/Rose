// vux 引入
import { Popup, dateFormat, numberComma, TransferDom } from 'vux'
// 请求 引入
import { getView, getViewList, getListClassfiy } from 'service/kmService'
// 组件引入
import searchIcon from 'components/search/search'
// 插件 引入
import RScroll from 'plugins/scroll/RScroll'

export default {
  components: { Popup, RScroll, searchIcon },
  data() {
    return {
      // 列表scroll参数
      page: 1,
      limit: 20,
      hasNext: true,
      scrollOptions: {
        click: true,
        pullDownRefresh: true,
        pullUpLoad: true,
      },
      // 流水scroll
      flowPage: 1,
      flowLimit: 20,
      FlowHasNext: true,
      FlowScrollOptions: {
        click: true,
        pullUpLoad: true,
      },
      total: null,                // 列表数据总量
      flowShow: false,            // 流水展示状态
      activeIndex: 0,             // 被选中下标
      view_id : '',               // 视图 ID
      serachVal: '',              // 搜索内容
      activeTab: '',              // 被选中的对应标题
      applyCode: '' ,
      calc_rel_code: '',
      flowData:[],                // 流水数据
      listData: [],               // 存货列表数据
      listView: [],               // 列表视图
      listField: [],              // 列表字段
      flowField: [],              // 流水显示字段
      flowTitle: {},              // 流水标题
      requestData : {},           // 请求流水数据的参数
    }
  },
  directives: { TransferDom },
  filters: { dateFormat, numberComma },
  methods: {
    // 重置列表条件
    resetCondition() {
      this.listData = [];
      this.page = 1;
      this.hasNext = true;
      this.$refs.bScroll.scrollTo(0, 0);
      this.$refs.bScroll.resetPullDown();
    },
    // tab切换
    tabClick(val, index) {
      this.activeIndex = index;
      this.activeTab = val.view_name;
      this.calc_rel_code = val.calc_rel_code;
      this.view_id = val.view_id;
      this.resetCondition();
      this.getList();
    },
    //搜索
    searchList({val = ''}) {
      this.serachVal = val;
      if(this.listView.length){
        this.resetCondition();
        this.getListData();
      }
    },
    getDefaultImg(item) {
      item.inventoryPic = require('assets/wl_default03.png');
    },
    //获取列表视图
    getClassfiy() {
        this.activeTab = this.tabItem[0].key;
        this.activeIndex = 0;
        this.getView();
        this.getListData();
        this.initSwiper();
        this.$nextTick(() => {
        this.listSwiper.update();
        });
    },
    //显示流水详情
    async getFlow(item) {
      if (this.activeTab.includes('现金流分类')) return; // ‘现金流分类识别’不需要点击事件
      this.flowData = [];
      this.flowPage = 1;
      //工作流锁定余额标不查询流水
      if (item.qtyLocked >= 0) return;
      this.flowTitle = item;
      this.$HandleLoad.show();
      let row = {};
      this.listField.forEach(item1=> {
        row[item1.field] = item[item1.field];

      })
      this.requestData = {
        view_id: 'obj_water_1',
        active_type: 'water',
        row :JSON.stringify(row)
      }
      //流水列表字段
      await getView({ ...this.requestData, view_scope: 'model' }).then( data => {
        this.flowField = data.model;
      }).catch( err => {
        // 关闭笼罩层
        this.$HandleLoad.hide();
      });
      await this.getFlowData();
      this.$HandleLoad.hide();
      this.flowShow = true;
      this.$nextTick(() => {
        this.$refs.flowListWrapper.scrollTo(0, 0);
        this.$refs.flowListWrapper.refresh();
      })
    },
    //获取流水列表数据
    getFlowData() {
      return getView({
        ...this.requestData,
        view_scope: 'data',
        page: this.flowPage,
        limit: this.flowLimit,
        start: (this.flowPage - 1) * this.flowLimit,
      }).then(({ data = [], total = 0 }) => {
        this.FlowHasNext = total > (this.flowPage - 1) * this.flowLimit + data.length;
        data.forEach( item => {
          item.showList = false;
          item.calcTime && (item.calcTime = dateFormat(item.calcTime,'YYYY-MM-DD'));
        })
        this.flowData = this.FlowHasNext === 1 ? data : this.flowData.concat(data);
        this.$nextTick(() => {
          this.$refs.flowListWrapper.finishPullUp();
        })
      })
    },
    //获取列表展示字段
    getView() {
      return getView({
        user_code: 1,
        view_scope: 'model',
        view_id: this.view_id,
        calc_rel_code: this.calc_rel_code
      }).then( data => {
        this.listField = data.model;
      })
    },
    //获取列表数据
    getListData(noReset = false) {
       return getViewList({
        user_code: 1,
        page: this.page,
        limit: this.limit,
        view_scope: 'data',
        device_type: 'phone',
        view_id: this.view_id,
        filter: this.serachVal,
        calc_rel_code: this.calc_rel_code,
        start: (this.page - 1) * this.limit,
      }).then(({ data = [], total = 0 }) => {
        let bankMap = {
          '交通银行': require('assets/iconfont/bank/bank_jt.png'),
          '建设银行': require('assets/iconfont/bank/bank_js.png'),
          '中国银行': require('assets/iconfont/bank/bank_zg.png'),
          '招商银行': require('assets/iconfont/bank/bank_zs.png'),
        };
        let hasAppIcon = ['核销余额表', '现金流计划表'];
        this.hasNext = total > (this.page - 1) * this.limit + data.length;
        data.forEach( item => {
          item.status = false;
          if (item.cashInOrOut) {
            switch (item.cashInOrOut) {
              case '流入':
                item.flowIconClass = 'iconfont icon-shangjiantou';
                item.flowWordClass = 'cashIn';
                break;
              case '流出':
                item.flowIconClass = 'iconfont icon-xiajiantou-copy';
                item.flowWordClass = 'cashOut';
                break;
            }
          }
          // 应用图标 初始化
          if (this.activeTab.includes('资金账户余额')) {
            item.icon = bankMap[item.bank];
          } else if (hasAppIcon.includes(this.activeTab)) {
            item.appIcon = `/dist/${item.appIcon}`;
          }

          // 物料图标 初始化
          if (item.inventoryPic) {
            item.inventoryPic = `/H_roleplay-si/ds/download?url=${item.inventoryPic}&width=400&height=400`;
          }
          else {
            // 设置默认物料图片
            this.getDefaultImg(item)
          }
        })
        this.listData = this.page === 1 ? data : this.listData.concat(data);
        if (!noReset) {
          this.$nextTick(() => {
            this.resetScroll();
          })
        }
        // 判断最近有无新增数据
        let text = '';
        if (noReset && this.activeIndex === 0){
          if (this.total){
            text = total - this.total === 0 ? '暂无新数据' : text = `新增${total-this.total}条数据`;
            this.$vux.toast.show({
              text: text,
              position:'top',
              width:'50%',
              type:"text",
              time : 700
            })
          }
        }
        //列表总数据缓存
        if (this.activeIndex === 0 && this.page === 1){
          sessionStorage.setItem(this.applyCode, total);
        }
        this.$loading.hide();
      }).catch(e => {
        console.log(e)
        this.resetScroll();
      })
    },
    //根据视图获取订单数据
    async getList(noReset = false) {
      await this.getView();
      await this.getListData(noReset);
    },
    // 重置下拉刷新、上拉加载的状态
    resetScroll() {
      this.$refs.bScroll.finishPullDown();
      this.$refs.bScroll.finishPullUp();
    },
    // 上拉加载
    onPullingUp() {
      this.page++;
      this.getListData();
    },
    // 下拉刷新
    onPullingDown() {
      this.page = 1;
      this.getData(true);
    },
    //流水scroll上拉加载
    onPullingUpFlow() {
      this.flowPage++;
      this.getFlowData()
    },
    //获取上次存储的列表总数量
    getSession() {
      return new Promise( resolve => {
        this.total = sessionStorage.getItem(this.applyCode);
        resolve()
      })
    },
    async getData(noReset) {
      await this.getSession();
      if (noReset) {
        await this.getList(true).then(() => {
            this.$nextTick(() => {
              this.$refs.bScroll.finishPullDown().then(() => {
                this.$refs.bScroll.finishPullUp();
              });
            })
        });
        return
      }
      await this.getList();
    }
  },
  created() {
    this.applyCode = this.$route.params.code;
    (async () => {
      await this.getClassfiy();
    //   await this.getView();
    //   await this.getListData();
    })()
  }
}
