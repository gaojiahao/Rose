// vux 引入
import { dateFormat, numberComma } from 'vux'
// 请求 引入
import { isMyflow } from 'service/detailService'
import { getAppDetail, getListMobileView } from 'service/app-basic/appSettingService'
import { getSellOrderList } from 'service/listService'
// 组件 引入
import RScroll from 'plugins/scroll/RScroll'
import searchIcon from 'components/search/search'
import RTab from 'components/list/commonPart/RTab'
import RSort from 'components/list/commonPart/RSort'
import addBtn from 'components/list/commonPart/addBtn'
import materListItem from 'components/list/commonPart/materListItem'
// 插件 引入
import { toFixed } from '@/plugins/calc'
import { accAdd, accMul } from 'plugins/calc/decimalsAdd'
// 微信 JS-SDK
import { register } from 'plugins/wx'
import {shareContent } from 'plugins/wx/api'
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
      count: 0,
      limit: 20,
      hasNext: true,
      activeIndex: 0,
      scrollOptions: {
        click: true,
        pullUpLoad: true,
        pullDownRefresh: true,
      },
      filterList: [ // 过滤列表
        {
          name: '交易号',
          value: 'transCode',
        }, {
          name: '经办人',
          value: 'handlerName',
        }, {
          name: '物料名称',
          value: 'inventoryName_transObjCode',
        }, {
          name: '往来名称',
          value: 'dealerName_dealerDebit',
        },
      ],
      serachVal: '',
      activeTab: '',
      listData: [],
      total: null, //列表数据总量
      applyCode: '',
      clickVisited: false, // 判断是否点击过其它列表项
      filterProperty: '', // 过滤的key
      sort: [],
      timeFilter: {
        startDate: '',
        endDate: ''
      },
      otherFilter: {},
      action: {}, // 表单允许的操作
      viewConfig: {},
      _cachedFieldSettings:[],
      filterFieldSettings:[],
    }
  },
  components: {
    RTab, RSort, RScroll,
    addBtn, searchIcon, materListItem
  },
  methods: {
    goDetail(item, index) {
      if (this.clickVisited) return;
      // 交易号、应用名称等
      let { transCode } = item,
        { name, listId } = this.$route.query,
        { folder, fileName } = this.$route.params;
      // 高亮点击的列表
      this.clickVisited = true;
      item.visited = true;
      this.$set(this.listData, index, { ...item });
      let start = Date.now();
      const TRANSITION_TIME = 200; // 动画时间
      // 判断是否是重新提交，如果是，跳转到创建订单页面
      isMyflow({ transCode }).then(({ tableContent }) => {
        let jump = () => {
          let path = '';
          this.clickVisited = false;
          if (tableContent.length > 0) {
            let { isMyTask, nodeName } = tableContent[0];
            if (isMyTask === 1 && nodeName === '重新提交') {
              path = `/fillform/${listId}/0`;
            } else {
              path = `/detail/${listId}/0`;
            }
          } else {
            path = `/detail/${listId}/0`;
          }
          this.$router.push({
            path,
            query: { name, 
              folder,
              fileName,
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
        this.$set(this.listData, index, { ...item });
      })
    },
    goEdit() {
      let { name,listId} = this.$route.query,
      { folder, fileName } = this.$route.params;
      this.$router.push({
        path: `/fillform/${listId}/0`,
        query: { name,folder,listId,fileName }
      })
    },
    // 重置列表条件
    resetCondition() {
      this.listData = [];
      this.page = 1;
      this.hasNext = true;
      this.$nextTick(() => {
        this.$refs.bScroll.scrollTo(0, 0);
        this.$refs.bScroll.resetPullDown();
      })
    },
    // tab切换
    tabClick(item, index) {
      this.activeIndex = index;
      this.activeTab = item.status;
      this.resetCondition();
      this.getList();
    },
    //搜索
    searchList({ val = '', property = '' }) {
      this.serachVal = val;
      this.filterProperty = property;
      this.otherFilter = {};
      this.timeFilter = {};
      this.$refs.sort && this.$refs.sort.filterReset()
      this.resetCondition();
      this.getList();
    },
    // 设置状态的class和显示的名称
    setStatus(item) {
      switch (item.biStatus) {
        case '已生效':
          item.whichIcon = 'icon-yishengxiao';
          item.statusClass = 'duty_done_c';
          item.statusName = '';
          break;
        case '进行中':
          item.statusClass = 'duty_doing_c';
          item.statusName = '进行中';
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
    // 获取默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 重置下拉刷新、上拉加载的状态
    resetScroll() {
      this.$refs.bScroll.finishPullDown();
      this.$refs.bScroll.finishPullUp();
    },
    // 上拉加载
    onPullingUp() {
      this.page++;
      this.getList();
    },
    // 下拉刷新
    onPullingDown() {
      this.page = 1;
      this.getData(true);
    },
    // 重置数据
    reloadData() {
      this.serachVal = '';
      this.activeTab = '';
      this.activeIndex = 0;
      this.resetCondition();
      // this.getData(false);
      this.onPullingDown();
    },
    // 获取上次存储的列表总数量
    getSession() {
      return new Promise(resolve => {
        this.total = sessionStorage.getItem(this.applyCode);
        resolve()
      })
    },
    // 获取订单数据
    getList(noReset = false) {
      let filter = [];
      // tab 切换
      if (this.activeTab) {
        filter = [{
          operator: "like",     //模糊查询like，精确查询eq
          property: "biStatus",
          value: this.activeTab
        }]
      }
      // 搜索
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
      // 过滤
      if (Object.keys(this.otherFilter).length) {
        let keyArr = Object.keys(this.otherFilter);
        for (let key in this.otherFilter) {
          if(this.otherFilter[key].kind){
            let obj = {
              property: key,
              operator: 'btw'
            }
            this.otherFilter[key].value.forEach((item, index) => {
              let key = 'value';
              obj[key] = item;
            })
            filter.push(obj);
          } else {
            let obj = {
              property: key,
              operator: 'in'
            }
            this.otherFilter[key].value.forEach((item, index) => {
              let key = `value${index + 1}`;
              obj[key] = item;
            })  
            filter.push(obj);
          }
        }

      }
      // 时间过滤
      if (this.timeFilter.startDate || this.timeFilter.endDate) {
        let obj = {
          property: "modTime",
          operator: "date",
          startDate: this.timeFilter.startDate,
          endDate: this.timeFilter.endDate,
        }
        filter.push(obj);
      }
      return getSellOrderList(this.listId, {
        limit: this.limit,
        page: this.page,
        filter: JSON.stringify(filter),
        sort: JSON.stringify(this.sort),
      }).then(({ total = 0, instanceList = [] }) => {
        let [first = {}] = instanceList;
        let [firstDetail = {}] = first.detailItem || [];
        let picKeys = ['inventoryPic', 'inventoryPic_transObjCode', 'inventoryPic_outPutMatCode', 'facilityPic_facilityObjCode'];
        // 图片的key
        let picKey = Object.keys(firstDetail).find(item => picKeys.includes(item));
        this.hasNext = total > (this.page - 1) * this.limit + instanceList.length;
        instanceList.forEach(item => {
          this.setStatus(item);
          item.count = 0;
          item.totalQty = 0;
          // 不同应用返回的字段名不同，统一增加渲染的公共字段包括（物料，往来）
          item.dealerName = item.dealerName_dealerDebit || item.dealerName_dealerCodeCredit;
          item.crtTime = dateFormat(item.crtTime, 'YYYY-MM-DD HH:mm:ss');
          item.modTime = dateFormat(item.modTime, 'YYYY-MM-DD HH:mm:ss');
          item.itemCount = item.detailItem.length;
          // 列表当中每个订单最多展现3个物料
          // item.detailItem = item.detailItem.slice(0, 3);
          item.detailItem.forEach(mItem => {
            // 计算totalQty
            if (mItem.assistQty != null) {
              item.totalQty = toFixed(accAdd(item.totalQty, mItem.assistQty));
            }
            else if (mItem.assistQty == null && mItem.tdQty != null) {
              item.totalQty = toFixed(accAdd(item.totalQty, mItem.tdQty));
            }
            // 有的应用不涉及金额合计 则不用计算
            if (mItem.tdAmount) {
              item.count = toFixed(accAdd(item.count, mItem.tdAmount));
            }
            // 有物料的增加统一渲染字段
            if (mItem.inventoryName_transObjCode || mItem.inventoryName_outPutMatCode) {
              mItem.inventoryName = mItem.inventoryName_transObjCode || mItem.inventoryName_outPutMatCode;
              mItem.inventoryCode = mItem.inventoryCode_transObjCode || mItem.inventoryCode_outPutMatCode;
              mItem.specification = mItem.specification_transObjCode || mItem.specification_outPutMatCod;
              mItem.measureUnit = mItem.measureUnit_transObjCode || mItem.measureUnit_outPutMatCode;
              mItem.inventoryPic = mItem[picKey]
                // 请求图片
                ? `/H_roleplay-si/ds/download?url=${mItem[picKey]}&width=400&height=400`
                // 默认图片
                : this.getDefaultImg();
            }
            // 设备
            if (mItem.facilityCode_facilityObjCode) {
              mItem.inventoryName = mItem.facilityName_facilityObjCode;
              mItem.inventoryCode = mItem.facilityCode_facilityObjCode;
              mItem.specification = mItem.facilitySpecification_facilityObjCode;
              mItem.measureUnit = mItem.facilityUnit_facilityObjCode;
              mItem.inventoryPic = mItem[picKey]
                // 请求图片
                ? `/H_roleplay-si/ds/download?url=${mItem[picKey]}&width=400&height=400`
                // 默认图片
                : this.getDefaultImg();
            }
          })
        });
        this.listData = this.page === 1 ? instanceList : [...this.listData, ...instanceList];
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
      // await this.getList();

    },
    // 修改是否访问的状态
    changeVisitedStatus() {
      let tmp = [...this.listData];
      setTimeout(() => {
        tmp.forEach(item => {
          item.visited = false;
        });
      }, 200)
      this.listData = tmp;
    },
    // 排序
    onSortList(val) {
      this.sort = val.property ? [val] : [];
      this.resetCondition();
      this.getList();
    },
    // tab切换
    onTabClick({ status = '', index = 0 }) {
      this.activeIndex = index;
      this.activeTab = status;
      this.resetCondition();
      this.getList();
    },
    // 筛选过滤
    onFilter(val) {
      this.serachVal = '';
      this.$refs.search.clearVal();
      if (!this.sort.length) {
        this.sort = [
          {
            property: 'modTime',
            direction: 'DESC'
          }
        ]
      }
      this.timeFilter = val.timeFilter;
      this.otherFilter = val.otherFilter;
      this.resetCondition();
      this.getList();
    },
    // 获取应用详情
    getAppDetail() {
      return getAppDetail(this.listId).then(([data = {}]) => {
        let { action } = data;
        this.action = action;
      })
    },
    getListMobileView() {
      var me = this;
      me.fieldsObj = [];
      return getListMobileView(me.listId).then(data => {
        let viewRecord = data[0];
        if (viewRecord) {
          me.viewConfig = JSON.parse(viewRecord.content);
          me.viewConfig.fields.filter(it => {
            return !it.isHidden;
          }).forEach(it => {
            let key = it.fieldCode;
            if (it.parentCode) {
              key = key + '_' + it.parentCode;
            }
            // me.fieldsObj[key] = it.alias ? it.alias : it.fieldName;
            me.fieldsObj.push({
              fieldName:it.alias ? it.alias : it.fieldName,
              fieldCode:key,
              isSummary:it.isSummary
            });

          });
          this.getViewFields();
        }
      });
    },
    cachedFieldSettings: function (codes) {
      var me = this,
          ret;

      console.log('2',me.$r2FieldSetting);
      if (Array.isArray(codes)) {
        var r2FieldSetting = me.$r2FieldSetting || JSON.parse(window.sessionStorage.getItem('r2FieldSetting')),
          ret = codes.map(function (c) {
              return r2FieldSetting[c];
          });
          ret = ret.filter(function (it) {
              return !!it;
          });
          return ret;
      } else {
          return r2FieldSetting[codes];
      }
    },
    getViewFields:function(){
      var me = this,
          trueFields = this.viewConfig.fields.filter(function(f){return !f.hidden;}),
          fieldCodes = trueFields.map(function (f) {
            return f.fieldCode;
          }),
          fieldSettings = this.cachedFieldSettings(fieldCodes),
          result =trueFields.map(function(f){
            var fieldSetting = fieldSettings.find(function(fs){
              return f.fieldCode === fs.fieldCode;
            });
            var ret = {
                name: f.alias||f.fieldName,
                code: f.parentCode ? f.fieldCode+'_'+f.parentCode : f.fieldCode,
                type: fieldSetting.fieldType,
                text: f.text,
                sequence: f.sequence,
            };
            if (fieldSetting) {
                ret.config = fieldSetting.config;
                if (fieldSetting.optionItems) {
                    ret.config.optionState = JSON.stringify(fieldSetting.optionItems.filter(function (option) {
                        return option.listId === undefined || option.listId === me.applyCode;
                    }));
                    // (ret.config.optionState).sort(function(a, b){return a.sort - b.sort});
                }
            }
            if (fieldSetting && fieldSetting.valueType && fieldSetting.valueType.gridFilter) {
                ret.filter = {
                    fieldLabel: f.text,
                    type: fieldSetting.valueType.gridFilter
                };
            } else {
                ret.filter = {
                    fieldLabel: f.text,
                    type: f.type
                };
            }
            return ret;
          });
      this.filterFieldSettings = result.sort(function(a, b){return a.sequence - b.sequence});
    }
  },
  filters: {
    // 过滤日期
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
    register(); // 注册wx-js-sdk
    this.applyCode = this.$route.query.listId;
    let { name, listId, transCode } = this.$route.query;
    this.listId = listId;
    this.getAppDetail();
    this.getListMobileView();
    this.getData(false).then(() => {
      /*
      * 第一次进入页面成功之后 隐藏动画
      * 如果是从推送打开 则不关闭动画
      */
      if (!transCode) {
        this.$loading.hide();
      }
      // wx.ready(() => {
      //   // 分享
      //   let shareInfo = {
      //     title: `点击查看${name}列表`,
      //     desc: `点击查看${name}列表，可创建新的订单`,
      //     imgUrl: ''
      //   }
      //   shareContent(shareInfo);
      // })
    });
    var deafalutSort = {
      direction:'desc',
      property:'crtTime'
    }
    // this.onSortList(deafalutSort);
  },

}
