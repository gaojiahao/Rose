import {Tab, Icon, TabItem, numberPad, numberComma } from 'vux'
import {getSellOrderList} from 'service/listService'
import {isMyflow} from 'service/detailService'
import searchIcon from 'components/search'
import RScroll from 'components/RScroll'

export default {
  data() {
    return {
      page: 1,
      limit: 20,
      hasNext: true,
      scrollOptions: {
        click: true,
        pullDownRefresh: true,
        pullUpLoad: true,
      },
      listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
      activeIndex: 0,
      serachVal: '',
      listData: [],
      activeTab: '',
      count: 0,
    }
  },
  components: {
    Tab, Icon, TabItem, searchIcon, RScroll
  },
  methods: {
    goDetail(transCode) {
      let {code} = this.$route.params;
      //判断是否是重新提交，如果是，跳转到创建订单页面
      isMyflow({transCode}).then(({tableContent}) => {
        if (tableContent.length > 0) {
          let {isMyTask, nodeName} = tableContent[0];
          if (isMyTask === 1 && nodeName === '重新提交') {
            this.$router.push({
              path: `/list/${code}/fillform`,
              query: {
                transCode: transCode
              }
            })
          } else {
            this.$router.push({
              path: `/list/${code}/detail`,
              query: {
                transCode: transCode
              }
            })
          }
        } else {
          this.$router.push({
            path: `/list/${code}/detail`,
            query: {
              transCode: transCode
            }
          })
        }
      })
    },
    goEdit() {
      let {code} = this.$route.params;
      this.$router.push({
        path: `/list/${code}/fillform`,
      })
    },
    // TODO 重置列表条件
    resetCondition() {
      this.listData = [];
      this.page = 1;
      this.hasNext = true;
      this.$refs.bScroll.scrollTo(0, 0);
      this.$refs.bScroll.resetPullDown();
    },
    ///tab切换
    tabClick(item, index) {
      this.activeIndex = index;
      this.activeTab = item.status;
      this.resetCondition();
      this.getList();
    },
    searchList(val) {
      this.serachVal = val;
      this.resetCondition();
      this.getList();
    },
    // TODO 设置状态的class和显示的名称
    setStatus(item) {
      switch (item.biStatus) {
        case '进行中':
          item.statusClass = 'duty_doing_c';
          item.statusName = '进行中';
          break;
        case '已生效':
          item.statusClass = 'duty_done_c';
          item.statusName = '已生效';
          break;
        case '已失效':
          item.statusClass = 'duty_fall_c';
          item.statusName = '已失效';
          break;
      }
    },
     //获取销售订单数据
    getList(noReset = false) {
      let filter = {
        biStatus: this.activeTab,
        transCode: this.serachVal,
        handlerName: this.serachVal,
        inventoryName : this.serachVal
      };
      return getSellOrderList({
        limit: this.limit,
        page: this.page,
        listViewID: this.listViewID,
        filter: JSON.stringify(filter),
      }).then(({total = 0, orders = []}) => {
        this.hasNext = total > (this.page - 1) * this.limit + orders.length;
        orders.forEach(item => {
          this.setStatus(item);
          item.count = 0;
          item.itmes.forEach(mitem=>{
            if(mitem.tdAmount>0){
              item.count += mitem.tdAmount*100;
              return
            }
            item.count += mitem.price*mitem.tdQty*100
            
          })
          item.count = item.count/100;
          // 列表当中每个订单最多展现5个物料
          item.itmes = item.itmes.slice(0, 5);
          item.itmes.forEach(mItem => {
            mItem.inventoryPic = mItem.inventoryPic 
              // 请求图片
              ? `/H_roleplay-si/ds/download?url=${mItem.inventoryPic}&width=400&height=400`
              // 默认图片
              : this.getDefaultImg();
          })
        });
        this.listData = this.page === 1 ? orders : this.listData.concat(orders);
        if (!noReset) {
          this.$nextTick(() => {
            this.resetScroll();
          })
        }
      }).catch(e => {
        this.resetScroll();
      })
    },
    // TODO 获取默认图片
    getDefaultImg(item) {
      let url = require('assets/wl.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // TODO 重置下拉刷新、上拉加载的状态
    resetScroll() {
      this.$refs.bScroll.finishPullDown();
      this.$refs.bScroll.finishPullUp();
    },
    // TODO 上拉加载
    onPullingUp() {
      this.page++;
      this.getList();
    },
    // TODO 下拉刷新
    onPullingDown() {
      this.page = 1;
      this.getList(true).then(() => {
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullDown().then(() => {
            this.$refs.bScroll.finishPullUp();
          });
        })
      });
    },
    //重置数据
    reloadData() {
      this.serachVal = '';
      this.activeTab = '';
      this.activeIndex = 0;
      this.resetCondition();
      this.getList();
    }
  },
  filters: {
    // TODO 过滤日期
    filterTime(val) {
      if (val) {
        let date = val.split(' ')[0];
        return date
      }

    },
    numberComma,
  },
  created() {
    this.getList();
  }

}
