import {Tab, Icon, TabItem, numberComma, dateFormat,} from 'vux'
import {getSellOrderList} from 'service/listService'
import {isMyflow} from 'service/detailService'
import searchIcon from 'components/search'
import RScroll from 'components/RScroll'
import ListItem from 'components/list/commonPart/ListItem'
import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'

import {toFixed} from '@/plugins/calc'

export default {
  props: {
    refreshRequest: {
      type: Boolean,
      default: false
    }
  },
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
      total: null, //列表数据总量
      applyCode: '',
      clickVisited: false, // 判断是否点击过其它列表项
      filterProperty: '', // 过滤的key
      filterList: [ // 过滤列表
        {
          name: '编码',
          value: 'transCode',
        }, {
          name: '经办人',
          value: 'handlerName',
        }, {
          name: '物料名称',
          value: 'inventoryName',
        }, {
          name: '往来信息',
          value: 'dealerName',
        },
      ],
    }
  },
  components: {
    Tab, Icon, TabItem, searchIcon, RScroll, ListItem,
  },
  methods: {
    goDetail(item, index) {
      if (this.clickVisited) {
        return
      }
      let {transCode} = item;
      let {code} = this.$route.params;
      this.clickVisited = true;
      item.visited = true;
      this.$set(this.listData, index, {...item});
      let start = Date.now();
      const TRANSITION_TIME = 200; // 动画时间
      //判断是否是重新提交，如果是，跳转到创建订单页面
      isMyflow({transCode}).then(({tableContent}) => {
        let jump = () => {
          let path = '';
          this.clickVisited = false;
          if (tableContent.length > 0) {
            let {isMyTask, nodeName} = tableContent[0];
            if (isMyTask === 1 && nodeName === '重新提交') {
              path = `/fillform/${code}`;
            } else {
              path = `/detail/${code}`;
            }
          } else {
            path = `/detail/${code}`;
          }
          this.$router.push({
            path,
            query: {
              transCode
            }
          })
        };
        let calcTime = Date.now() - start;
        // 请求结束时间大于动画时间则直接跳转到详情页
        if (calcTime > TRANSITION_TIME) {
          jump();
        } else {
          // 等待动画结束后跳转
          setTimeout(() => {
            jump();
          }, TRANSITION_TIME - calcTime);
        }
      }).catch(e => {
        this.clickVisited = false;
        item.visited = false;
        this.$set(this.listData, index, {...item});
      })
    },
    goEdit() {
      let {code} = this.$route.params;
      this.$router.push({
        path: `/fillform/${code}`,
      })
    },
    // TODO 重置列表条件
    resetCondition() {
      this.listData = [];
      this.page = 1;
      this.hasNext = true;
      this.$nextTick(() => {
        this.$refs.bScroll.scrollTo(0, 0);
        this.$refs.bScroll.resetPullDown();
      })
    },
    ///tab切换
    tabClick(item, index) {
      switch (item.status) {
        case '已生效' :
          this.biStatus = '1';
          break;
        case '进行中' :
          this.biStatus = '2';
          break;
        case '' :
          this.biStatus = '';
          break;
      }
      this.activeIndex = index;
      this.activeTab = item.status;
      this.resetCondition();
      this.getList();
    },
    searchList({val = '', property = ''}) {
      this.serachVal = val;
      this.filterProperty = property;
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
    // TODO 获取默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default02.png');
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
      this.getData(true);
    },
    //重置数据
    reloadData() {
      this.serachVal = '';
      this.activeTab = '';
      this.activeIndex = 0;
      this.resetCondition();
      // this.getData(false);
      this.onPullingDown();
    },
    //获取上次存储的列表总数量
    getSession() {
      return new Promise(resolve => {
        this.total = sessionStorage.getItem(this.applyCode);
        resolve()
      })
    },
    //获取订单数据
    getList(noReset = false) {
      let filter = [
        {
          operator: "like",     //模糊查询like，精确查询eq
          property: "biStatus",
          value: this.activeTab
        }
      ];
      if (this.serachVal) {
        filter[0].attendedOperation = 'and';
        filter.push({
          operator: "like",     //模糊查询like，精确查询eq
          property: this.filterProperty,
          value: this.serachVal
        })
      }
      return getSellOrderList({
        limit: this.limit,
        page: this.page,
        listViewID: this.listViewID,
        filter: JSON.stringify(filter),
      }).then(({total = 0, orders = []}) => {
        // this.$emit('input',false);
        this.hasNext = total > (this.page - 1) * this.limit + orders.length;
        orders.forEach(item => {
          this.setStatus(item);
          item.count = 0;
          item.businessKey = item.transCode.replace(/_/g, '');
          item.itmes.forEach(mitem => {
            // 当 count = tdAmount 相加的时候
            if (mitem.tdAmount > 0) {
              if (mitem.tdQty > 0 && mitem.price > 0) {
                mitem.noTaxAmount = accMul(mitem.price, mitem.tdQty);
                mitem.taxAmount = accMul(mitem.noTaxAmount, 0.16);
                mitem.tdAmount = accAdd(mitem.noTaxAmount, mitem.taxAmount);
              }
              item.count = toFixed(accAdd(item.count, mitem.tdAmount));
              return
            }
            // 当 count = price * tdqty
            let amount = accMul(mitem.price, mitem.tdQty);
            item.count = toFixed(accAdd(item.count, amount));
          })
          item.itemCount = item.itmes.length;
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
        //判断最近有无新增数据
        let text = '';
        if (noReset && this.activeIndex === 0) {
          if (this.total) {
            text = total - this.total === 0 ? '暂无新数据' : text = `新增${total - this.total}条数据`;
            this.$vux.toast.show({
              text: text,
              position: 'top',
              width: '50%',
              type: "text",
              time: 700
            })
          }
        }
        //列表总数据缓存
        if (this.activeIndex == 0 && this.page === 1) {
          sessionStorage.setItem(this.applyCode, total);
        }
      }).catch(e => {
        this.resetScroll();
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
          // 提交之后成功请求数据 隐藏动画
          this.$loading.hide();
        });
        return
      }
      await this.getList();

    },
    // TODO 修改是否访问的状态
    changeVisitedStatus() {
      let tmp = [...this.listData];
      setTimeout(() => {
        tmp.forEach(item => {
          item.visited = false;
        });
      }, 200)
      this.listData = tmp;
    },
  },
  filters: {
    // TODO 过滤日期
    filterTime(val) {
      if (val) {
        val = dateFormat(val);
        let date = val.split(' ')[0];
        return date
      }
    },
    numberComma,
    dateFormat,
    toFixed,
  },
  created() {
    this.applyCode = this.$route.params.code;
    this.getData(false).then(() => {
      // 第一次进入页面成功之后 隐藏动画
      this.$loading.hide();
    });
  },

}
