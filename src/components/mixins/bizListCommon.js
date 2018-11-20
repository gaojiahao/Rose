import { Tab, Icon, TabItem, numberComma, dateFormat } from 'vux'
import { getSellOrderList } from 'service/listService'
import { isMyflow } from 'service/detailService'
import searchIcon from 'components/search'
import RScroll from 'components/RScroll'
import ListItem from 'components/list/commonPart/ListItem'
import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'
import RSort from 'components/list/commonPart/RSort'
import RTab from 'components/list/commonPart/RTab'
import { toFixed } from '@/plugins/calc'
// 引入映射表 (不可移除)
import Apps from '@/home/pages/maps/businessApp'
import AppsFile from '@/home/pages/maps/businessFile'
/* 引入微信相关 */
import {register} from 'plugins/wx'
import { shareContent } from 'plugins/wx/api'

export default {
  props: {
    refreshRequest: {
      type: Boolean,
      default: false
    }
  },
  data () {
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
          name: '交易号',
          value: 'transCode',
        }, {
          name: '经办人',
          value: 'handlerName',
        }, {
          name: '物料名称',
          value: 'inventoryName',
        }, {
          name: '往来名称',
          value: 'dealerName',
        },
      ],
      sort: [],
      timeFilter: {
        startDate: '',
        endDate: ''
      },
      otherFilter: []
    }
  },
  components: {
    Tab, Icon, TabItem, searchIcon, RScroll, ListItem,
    RSort, RTab,
  },
  methods: {
    goDetail (item, index) {
      if (this.clickVisited) {
        return
      }
      // 交易号、应用名称等
      let {transCode} = item,
        {name} = this.$route.query,
        {fileId, listId} = this.$route.params;
      // 高亮点击的列表
      this.clickVisited = true;
      item.visited = true;
      this.$set(this.listData, index, {...item});
      let start = Date.now();
      const TRANSITION_TIME = 200; // 动画时间
      // 判断是否是重新提交，如果是，跳转到创建订单页面
      isMyflow({transCode}).then(({tableContent}) => {
        let jump = () => {
          let path = '';
          this.clickVisited = false;
          if (tableContent.length > 0) {
            let {isMyTask, nodeName} = tableContent[0];
            if (isMyTask === 1 && nodeName === '重新提交') {
              path = `/fillform/${fileId}/${listId}`;
            } else {
              path = `/detail/${fileId}/${listId}`;
            }
          } else {
            path = `/detail/${fileId}/${listId}`;
          }
          this.$router.push({
            path, query: {name, transCode}
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
    goEdit () {
      let {name} = this.$route.query,
        {fileId, listId} = this.$route.params;
      this.$router.push({
        path: `/fillform/${fileId}/${listId}`,
        query: {name}
      })
    },
    // TODO 重置列表条件
    resetCondition () {
      this.listData = [];
      this.page = 1;
      this.hasNext = true;
      this.$nextTick(() => {
        this.$refs.bScroll.scrollTo(0, 0);
        this.$refs.bScroll.resetPullDown();
      })
    },
    // tab切换
    tabClick (item, index) {
      this.activeIndex = index;
      this.activeTab = item.status;
      this.resetCondition();
      this.getList();
    },
    searchList ({val = '', property = ''}) {
      this.serachVal = val;
      this.filterProperty = property;
      this.resetCondition();
      this.getList();
    },
    // TODO 设置状态的class和显示的名称
    setStatus (item) {
      switch (item.biStatus) {
        case '进行中':
          item.statusClass = 'duty_doing_c';
          item.statusName = '进行中';
          break;
        case '已生效':
          item.statusClass = 'duty_done_c';
          item.statusName = '已生效';
          break;
        case '草稿':
          item.statusClass = 'duty_fall_c';
          item.statusName = '草稿';
          break;
        case '已失效':
          item.statusClass = 'duty_fall_c';
          item.statusName = '已失效';
          break;

      }
    },
    // TODO 获取默认图片
    getDefaultImg (item) {
      let url = require('assets/wl_default02.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // TODO 重置下拉刷新、上拉加载的状态
    resetScroll () {
      this.$refs.bScroll.finishPullDown();
      this.$refs.bScroll.finishPullUp();
    },
    // TODO 上拉加载
    onPullingUp () {
      this.page++;
      this.getList();
    },
    // TODO 下拉刷新
    onPullingDown () {
      this.page = 1;
      this.getData(true);
    },
    // 重置数据
    reloadData () {
      this.serachVal = '';
      this.activeTab = '';
      this.activeIndex = 0;
      this.resetCondition();
      // this.getData(false);
      this.onPullingDown();
      // 工单派工，启动，验收提交成功之后返回列表需要重新请求pop数据
      let name = this.$route.query.name;
      if (name === '工单任务派工' || name === '工单任务启动' || name === '工单任务验收') {
        this.$refs.taskWork.getWorkOrderTask()
      }
    },
    // 获取上次存储的列表总数量
    getSession () {
      return new Promise(resolve => {
        this.total = sessionStorage.getItem(this.applyCode);
        resolve()
      })
    },
    // 获取订单数据
    getList (noReset = false) {
      let filter = [];
      if (this.activeTab) {
        filter = [{
          operator: "like",     //模糊查询like，精确查询eq
          property: "biStatus",
          value: this.activeTab
        }]
      }
      if (this.serachVal) {
        let obj = {
          operator: "like",     
          property: this.filterProperty,
          value: this.serachVal
        }
        if (this.activeTab) {
          obj.attendedOperation = 'and';
        }
        filter = [
          ...filter,
          obj
        ];
      }
      if(this.otherFilter.length){
        let obj = {
          property: "processStatus",
          operator: "in",
        }
        if(this.activeTab || this.serachVal){
          obj.attendedOperation = 'and'
        }
        this.otherFilter.forEach((item,index) => {
          let key = `value${index+1}`;
          obj[key] = item.fieldVlaue;
        })
        filter.push(obj);
        
      }
      return getSellOrderList({
        limit: this.limit,
        page: this.page,
        listViewID: this.listViewID,
        filter: JSON.stringify(filter),
        sort: JSON.stringify(this.sort),
        startDate: this.timeFilter.startDate, // 开始日期 (默认为空)
        endDate: this.timeFilter.endDate      // 截止日期 (默认为空)
      }).then(({total = 0, orders = []}) => {
        // this.$emit('input',false);
        this.hasNext = total > (this.page - 1) * this.limit + orders.length;
        orders.forEach(item => {
          this.setStatus(item);
          item.count = 0;
          item.itmes.forEach(mitem => {
            item.count = toFixed(accAdd(item.count, mitem.tdAmount));
          });

          // 如果为搜索物料，将匹配的物料放在前面
          if (this.serachVal && this.filterProperty === 'inventoryName') {
            item.itmes = item.itmes.reduce((arr, mitem) => {
              // 判断是否含有搜索内容
              if (mitem.inventoryName && mitem.inventoryName.includes(this.serachVal)) {
                mitem.matchedMat = true;
                arr.unshift(mitem)
              } else {
                arr.push(mitem);
              }
              return arr
            }, []);
          }

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
        // 判断最近有无新增数据
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
        // 列表总数据缓存
        if (this.activeIndex == 0 && this.page === 1) {
          sessionStorage.setItem(this.applyCode, total);
        }
      }).catch(e => {
        this.resetScroll();
      })
    },
    async getData (noReset) {
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
    changeVisitedStatus () {
      let tmp = [...this.listData];
      setTimeout(() => {
        tmp.forEach(item => {
          item.visited = false;
        });
      }, 200)
      this.listData = tmp;
    },
    // TODO 排序
    onSortList (val) {
      this.sort = val.property ? [val] : [];
      this.resetCondition();
      this.getList();
    },
    // TODO tab切换
    onTabClick ({status = '', index = 0}) {
      this.activeIndex = index;
      this.activeTab = status;
      this.resetCondition();
      this.getList();
    },
    // 筛选过滤
    onFilter (val) {
      this.timeFilter = val.timeFilter;
      this.otherFilter = val.biProcessStatus;
      this.resetCondition();
      this.getList();
    }
  },
  filters: {
    // TODO 过滤日期
    filterTime (val) {
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
    register(); // 注册wx-js-sdk
    this.applyCode = this.$route.params.code;
    let { name } = this.$route.query;
    this.$loading.hide();
    this.getData(false).then(() => {
      // 第一次进入页面成功之后 隐藏动画
      this.$loading.hide();
      wx.ready(() => {
        // 分享
        let shareInfo = {
          title: `点击查看${name}列表`, 
          desc: `点击查看${name}列表，可创建新的订单`,
          imgUrl : 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1542276320183&di=ef11baa4ce65f2ba1aed2b214cf4dacd&imgtype=0&src=http://www.qqzhi.com/uploadpic/2014-09-26/101958658.jpg'
          // imgUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1542258659397&di=ce722db1d3d4d79259a2b6cd4de9879b&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01851855f282cf6ac7251df8d15ea0.png%401280w_1l_2o_100sh.png'
          // imgUrl: `http://${document.domain}/H_roleplay-si/ds/download?url=/668466d5-f92d-445c-bd9d-410f4449fd94/ae5b6e81-ec16-4153-9dda-ba18246a73c2.jpg`
          // imgUrl : `http://${document.domain}/Hermes/static/assets/cg02.jpg`,
        }
        shareContent(shareInfo);
      })
    });
  },

}
