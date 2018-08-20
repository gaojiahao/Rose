import { CellFormPreview, Group, Cell,Tab, Icon, TabItem, TransferDom, Popup,dateFormat } from 'vux'
import { getListClassfiy,getView,getViewList} from 'service/kmService.js'
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
      listView: [], //列表视图
      calc_rel_code : '',
      view_id : '',
      listField :[], //列表字段
      flowShow :false, //流水展示状态
      flowTitle:{}, //流水标题
      flowField : [], //流水显示字段
      flowData:[],//流水数据
      activeIndex: 0,
      serachVal: '',
      listData: [], //存货列表数据
      activeTab: '',
      count: 0,
      total:null, //列表数据总量
      applyCode : '' ,
    }
  },
  directives: {
    TransferDom
  },
  components: {
    CellFormPreview,Group,Cell,searchIcon,RScroll,Tab, Icon, TabItem,Popup
  },
  filters: {
    dateFormat
  },
  methods: {
    // TODO 重置列表条件
    resetCondition() {
      this.listData = [];
      this.page = 1;
      this.hasNext = true;
      this.$refs.bScroll.scrollTo(0, 0);
      this.$refs.bScroll.resetPullDown();
    },
    ///tab切换
    tabClick(val) {
      this.calc_rel_code = val.calc_rel_code;
      this.view_id = val.view_id;
      this.resetCondition();
      this.getList();
    },
    //搜索
    searchList(val) {
      this.serachVal = val;
      this.resetCondition();
      this.getListData();
    },
    //获取列表视图
    getClassfiy(){
      return getListClassfiy({
        account_code: this.uniqueId
      }).then(({data = []})=>{
        this.listView = data;
        this.calc_rel_code = data[0].calc_rel_code;
        this.view_id = data[0].view_id;
      })
    },
    //显示流水详情
    async getFlow(item){
      this.flowTitle = item;
      this.handleLoadding = true;
      let row = {};
      this.listField.forEach(item1=>{
        row[item1.field] = item[item1.field];

      })
      let requestData = {
        view_id: 'obj_water_1',
        active_type: 'water',
        row :row
      }
      //流水列表字段
      await getView({...requestData,view_scope: 'model'}).then( data =>{
        this.flowField = data.model;
      });
      //流水列表数据
      await getView({...requestData,view_scope: 'data',page: 1,start: 0,limit: 25}).then(({data=[],total=0})=>{
        data.forEach(item=>{
          item.showList = false;
        })
        this.flowData = data;

      })
      this.handleLoadding = false;
      this.flowShow = true;
      this.$nextTick(() => {
        this.$refs.flowListWrapper.scrollTo(0, 0);
        this.$refs.flowListWrapper.refresh();
      })
    },
    //获取列表展示字段
    getView(){
      return getView({
        calc_rel_code: this.calc_rel_code,
        view_id: this.view_id,
        user_code: 1,
        view_scope: 'model'
      }).then(data=>{
        this.listField = data.model;

      })
    },
    //获取列表数据
    getListData(noReset = false){
      let filters='';
      if(this.serachVal!=''){
        for(let i = 0 ; i<this.filterArr.length ; i++){
          this.filterArr[i].value = this.serachVal;
        }
        filters = JSON.stringify(this.filterArr);
      }
       return getViewList({
        calc_rel_code: this.calc_rel_code,
        view_id: this.view_id,
        user_code: 1,
        view_scope: 'data',
        page:this.page,
        start:(this.page-1)*this.limit,
        limit: this.limit,
        filter:filters
      }).then(({data=[],total=0})=>{
        this.hasNext = total > (this.page - 1) * this.limit + data.length;
        data.forEach(item=>{
          item.status = false;
        })
        this.listData = this.page === 1 ? data : this.listData.concat(data);
        if (!noReset) {
          this.$nextTick(() => {
            this.resetScroll();
          })
        }
      }).catch(e => {
        this.resetScroll();
      })
    },
    //根据视图获取订单数据
    async getList(noReset = false) {
      await this.getView();
      await this.getListData(noReset);
    },
    // TODO 重置下拉刷新、上拉加载的状态
    resetScroll() {
      this.$refs.bScroll.finishPullDown();
      this.$refs.bScroll.finishPullUp();
    },
    // TODO 上拉加载
    onPullingUp() {
      this.page++;
      this.getListData();
    },
    // TODO 下拉刷新
    onPullingDown() {
      this.page = 1;
      this.getList(true).then(()=>{
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullDown().then(() => {
            this.$refs.bScroll.finishPullUp();
          });
        })

      });
    },
  },
  created() {
    // this.applyCode = this.$route.params.code;
    // this.getData(false);
    (async()=>{
      await this.getClassfiy();
      await this.getView();
      await this.getListData();
      this.$emit('input',false);

    })()
  },

}
