<template>
  <div class="detail_wrapper">
    <div class="list_top">
      <div class='search'>
        <form class="search_part" :class="'has-filter'" action="" @submit.prevent= "searchMenu">
          <i class="icon icon-search"></i>
          <input ref="searchInp" class="srh_inp" type="search" autocomplete="off"
                :placeholder="typeDatas[typeFlag]['nameText']" @input='getSearchValue($event)' :value='searchValue'>
          <div class="pop_cfm" @click="getData">搜索</div>
          <i class="icon-clear clear_icon" @click="clearSearch"></i>
        </form>
      </div>
    </div>
    <div class="title">
      <div class="duration">
        <r-picker 
          :title="timeTitle" 
          :data="timeList" 
          :value="timeValue"
          v-model="timeValue" 
          :required="false" 
          :mode="'2'">
        </r-picker>
      </div>
      <div class="group-container">
        <div class="group-button" :class="{activeGroup:typeFlag==='wl'}">
            <div @click="changeType('按物料查看')">按物料查看</div>
        </div>
        <div class="group-button" :class="{activeGroup:typeFlag==='ck'}">
            <div @click="changeType('按仓库查看')">按仓库查看</div>
          </div>
      </div>
    </div>
    <r-scroll :options="scrollOptions" class="scroll-container" ref="bScroll">
      <div class="part-left">
        <div class="left-header">
          {{typeDatas[typeFlag]['title']}}
        </div>
        <div v-for="(item, index) in listData" :key="index" :class="{'bg-color':item.total}">
          <div class="content-item" :style="{paddingLeft:`${item.indent*.65}em`}" ref="partLeft">
            <p class="groupName">{{item[typeDatas[typeFlag]['name']]}}</P>
            <p class="groupCode">{{item[typeDatas[typeFlag]['code']]}}</P>
          </div>
        </div>
      </div>
      <div class="swiper-container part-right">
        <div class="swiper-wrapper box">
          <div class="swiper-slide">
            <div class="right-header">
              <p class="parent-title">{{headInfo.firstPeriod}}</p>
              <p class="children-title">
                <span class="init">{{headInfo.initNum}}</span>
                <span class="credit">{{headInfo.drNum}}</span>
              </p>
            </div>
            <div class="right-list">
              <div v-for="(item, index) in listData" :key="index">
                <div class="content-item" ref="partRightInit">
                    <span>{{item.initQty | formatNum}}</span>
                    <span>{{item.drQty | formatNum}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-slide">
            <div class="right-header">
              <p class="parent-title">{{headInfo.firstPeriod}}</p>
              <p class="children-title">
                <span class="debit">{{headInfo.crNum}}</span>
                <span class="bl">{{headInfo.blNum}}</span>
              </p>
            </div>
            <div class="right-list">
              <div v-for="(item, index) in listData" :key="index">
                <div class="content-item" ref="partRightFinal">
                    <span>{{item.crQty | formatNum}}</span>
                    <span>{{item.blQty | formatNum}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-slide">
            <div class="right-header">
              <p class="parent-title">{{headInfo.lastPeriod}}</p>
              <p class="children-title">
                <span class="init">{{headInfo.initNum}}</span>
                <span class="credit">{{headInfo.drNum}}</span>
              </p>
            </div>
            <div class="right-list">
              <div v-for="(item, index) in listData" :key="index">
                <div class="content-item" ref="partRightInit2">
                    <span>{{item.initAmount | formatNum}}</span>
                    <span>{{item.drAmount | formatNum}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-slide">
            <div class="right-header">
              <p class="parent-title">{{headInfo.lastPeriod}}</p>
              <p class="children-title">
                <span class="debit">{{headInfo.crNum}}</span>
                <span class="bl">{{headInfo.blNum}}</span>
              </p>
            </div>
            <div class="right-list">
              <div v-for="(item, index) in listData" :key="index">
                <div class="content-item" ref="partRightFinal2">
                    <span>{{item.crAmount | formatNum}}</span>
                    <span>{{item.blAmount | formatNum}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </r-scroll>
  </div>
</template>

<script>
  import {getPsiDataByViewId} from 'service/kmService'
  import RScroll from 'plugins/scroll/RScroll'
  import {toFixed} from '@/plugins/calc'
  import {accAdd} from "plugins/calc/decimalsAdd";
  import {numberComma,Datetime,Group,dateFormat,Flexbox,FlexboxItem,PopupPicker} from 'vux'
  import {isPC,isQYWX,} from '@/plugins/platform/index'
  import RPicker from 'components/public/basicPicker'
  const storage = window[isPC||window.isApp ? 'localStorage' : 'sessionStorage'];
  const ROSE_TOKEN_KEY = 'ROSE_LOGIN_TOKEN';

  export default {
    name: "JXCForm",
    data() {
      return {
        endDate: '',
        headerSwiper: null,         // 顶部swiper
        partRightSwiper: null,      // 右侧金额swiper
        code: '',  
        localCurrency: "",                 // 路由参数
        headInfo:{},                // 表头信息
        listData: {},
        listMap: {
          JXC: {
            title: '利润表',
            firstPeriod:'数量',
            lastPeriod:'金额',
            initNum: '期初',
            drNum: '新增',
            crNum: '减少',
            blNum: '期末',
            request: getPsiDataByViewId
          },
        },
        scrollOptions: {
          click: true,
          bounce: {
            top: false
          }
        },
        typeFlag: 'wl',
        typeDatas:{
          ck:{
            title:'仓库',
            code:'whCode',
            name:'containerCodeOut_warehouseName',
            codeText:'仓库编码',
            nameText:'仓库名称'
          },
          wl:{
            title:'物料',
            code:'matCode',
            name:'outPutMatCode_inventoryName',
            codeText:'物料编码',
            nameText:'物料名称'
          }
        },
        timeTitle:'周期',
        timeList:['过去7天',
          '过去30天',
          '过去90天',
          '近两天',
          '昨天',
          '今日',
          '本周',
          '本月',
          '本季度',
          '本年',
          '上周',
          '上月',
          '上季度',
          '上年'],
        searchTimeList: {
          '过去7天':'$last7Days$',
          '过去30天':'$last30Days$',
          '过去90天':'$last90Days$',
          '近两天':'$lastTowDay$',
          '昨天':'$yesterday$',
          '今日':'$today$',
          '本周':'$thisWeek$',
          '本月':'$thisMonth$',
          '本季度':'$thisQuarter$',
          '本年':'$thisYear$',
          '上周':'$preWeek$',
          '上月':'$preMonth$',
          '上季度':'$preQuarter$',
          '上年':'$preYear$',
        },
        searchTypeList:{
          '按物料查看':'matCode',
          '按仓库查看':'whCode',
        },
        timeValue:'本月',
        typeList:['按物料查看','按仓库查看'],
        typeValue:'按物料查看',
        copyData:'',
        searchValue:'',
      }
    },
    components: {
      RScroll,
      Datetime,
      Group,
      Flexbox, 
      FlexboxItem,
      RPicker
    },
    props: {
      transcode: {
        type: String,
        default: ''
      },
      folder: {
        type: String,
        default: ''
      },
      name: {
        type: String,
        default: ''
      }
    },
    watch:{
      transcode:{
        handler(val){
          console.log(val)
        }
      },
      typeValue:{
        handler(val){
          if(val=='按物料查看'){
            this.typeFlag = 'wl';
          } else if(val=='按仓库查看'){
            this.typeFlag = 'ck';
          }
          var data = JSON.parse(this.copyData),
              me = this;
          var sorted =this.groupByType(data, function (item) {
            return [item[me.searchTypeList[me.typeValue]]];//按照name进行分组
          });
          this.listData = sorted;  
        }
      },
      timeValue:{
        handler(val){
          this.getData();      
        }
      }
    },
    methods: {
      // 获取资产负债表数据
      getData() {
        let entityId = JSON.parse(storage.getItem(ROSE_TOKEN_KEY)).entityId || {};
        let filter = [];
        filter = [
          {
            operator: 'btw',
            value: this.searchTimeList[this.timeValue],
            property: 'EFFECTIVE_TIME',
          }
        ];
        if(this.searchValue){
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.searchValue,
              property: this.typeDatas[this.typeFlag]['name'],
              }
          ];
        }
        var data = {
          _dc: Date.now(),
          strViewId: '63882579-5f7d-4708-b62c-89ba0c63f4e9',
          strEntityId: entityId,
          aryFilters: JSON.stringify(filter),
          intStart: 0,
          intLimit: 50,
        };
        return this.listMap[this.code].request(data).then(res => {
          let {data = []} = res;
          let me = this;
          this.copyData = JSON.stringify(data);
          var sorted =this.groupByType(data, function (item) {
            return [item[me.searchTypeList[me.typeValue]]];//按照name进行分组
          });
          this.listData = sorted;
          this.$nextTick(() => {
            // 设置金额行高度，判断高度是否与title相同，不相同则设置为title的高度
            this.setHeight(
              this.$refs.partLeft, 
              this.$refs.partRightInit, 
              this.$refs.partRightFinal,this.$refs.partRightInit2,this.$refs.partRightFinal2);
            this.$loading.hide();
          })
        })
      },
      groupByType(data,type){
        let groups = {};        
        data.forEach(function (o) { //注意这里必须是forEach 大写
            const group = type(o);
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });
        return Object.keys(groups).map(function (group) {
          var arr = [];
          arr.drQty= 0;
          arr.crQty=0;
          arr.initQty=0;
          arr.drAmount=0;
          arr.crAmount=0;
          arr.initAmount=0;
          arr.blQty=0;
          arr.blAmount=0;
          for(var i = 0; i < groups[group].length; i++){
            arr.drQty = accAdd(arr.drQty , groups[group][i]['drQty']?groups[group][i]['drQty']:0);
            arr.crQty = accAdd(arr.crQty , groups[group][i]['crQty']?groups[group][i]['crQty']:0);
            arr.initQty = accAdd(arr.initQty , groups[group][i]['initQty']?groups[group][i]['initQty']:0);
            arr.drAmount = accAdd(arr.drAmount , groups[group][i]['drAmount']?groups[group][i]['drAmount']:0);
            arr.crAmount = accAdd(arr.crAmount , groups[group][i]['crAmount']?groups[group][i]['crAmount']:0);
            arr.initAmount = accAdd(arr.initAmount , groups[group][i]['initAmount']?groups[group][i]['initAmount']:0);
            arr.blQty = accAdd(arr.blQty , groups[group][i]['blQty']?groups[group][i]['blQty']:0);
            arr.blAmount = accAdd(arr.blAmount , groups[group][i]['blAmount']?groups[group][i]['blAmount']:0);
            arr.matCode = groups[group][i]['matCode'];
            arr.outPutMatCode_inventoryName = groups[group][i]['outPutMatCode_inventoryName'];
            arr.outPutMatCode_inventoryType = groups[group][i]['outPutMatCode_inventoryType'];
            arr.outPutMatCode_inventorySubclass = groups[group][i]['outPutMatCode_inventorySubclass'];
            arr.outPutMatCode_specification = groups[group][i]['outPutMatCode_specification'];
            arr.containerCodeOut_warehouseName = groups[group][i]['containerCodeOut_warehouseName'];
            arr.containerCodeOut_warehouseType = groups[group][i]['containerCodeOut_warehouseType'];
            arr.whCode = groups[group][i]['whCode'];
          }
          return arr;
        });
      },
      // 设置高度
      setHeight(left,rightInit,rightFinal,rightInit2,rightFinal2) {
        let right = [rightInit,rightFinal];
        let right2 = [rightInit,rightFinal,rightInit2,rightFinal2];
        if(this.$refs.partRightYear){
          right.push(this.$refs.partRightYear);
        }
        if(this.$refs.partRightYear2){
          right2.push(this.$refs.partRightYear2);
        }
        left.forEach((item,index) => {
          right.forEach(rRight => {
            if(item.clientHeight !== rRight[index].clientHeight){
              rRight[index].style.height = `${item.clientHeight}px`;
            }
          })
          right2.forEach(rRight => {
            if(item.clientHeight !== rRight[index].clientHeight){
              rRight[index].style.height = `${item.clientHeight}px`;
            }
          })
        })
      },
      changeType(type){
        this.typeValue = type;
      },
      getSearchValue(e) {
        this.searchValue = e.target.value;
      },
      clearSearch(){
        this.searchValue = '';
        this.getData();1
      },
      // 初始化swiper
      initSwiper() {
        this.$nextTick(() => {
          this.partRightSwiper = new this.Swiper('.part-right',{slidesPerView : 'auto',
          longSwipersRadio: 0.9,
          freeMode: true,
          });
          this.partRightSwiper.controller && (this.partRightSwiper.controller.control = this.headerSwiper);
        })
      },
    },
    filters: {
      // 格式化数字
      formatNum(num) {
        if (!num) return '-';
        return `${numberComma(num.toFixed(2))}`;
      }
    },
    created() {
      this.$loading.show();
      let {trancode = ''} = this.$route.query;
      this.code = this.transcode;
      //获取表格的表头信息
      this.headInfo = { ...this.listMap[this.transcode] };
      if(this.headInfo['currentYearName']){
        this.endDate = dateFormat(new Date(), 'YYYY-MM');
      }else{
        this.endDate = dateFormat(new Date(), 'YYYY-MM-DD');
      }
      // 初始化数据
      this.initSwiper();
      this.getData();
    }
  }
</script>

<style scoped lang="scss">
  %border-1px {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    width: 200%;
    border-top: 1px solid #C7C7C7;
    color: #C7C7C7;
    transform-origin: 0 0;
    transform: scaleY(0.5);
    box-sizing: border-box;
  }

  .detail_wrapper {
    height: 100%;
    overflow: hidden;
    background-color: #fff;
    .list_top {
      width: 100%;
      background-color: #fff;
    }
    .search {
      width: 100%;
      padding: .08rem 0;
      .search_part {
        width: 100%;
        display: flex;
        height: .28rem;
        position: relative;
        line-height: .28rem;
        box-sizing: border-box;
        // 搜索输入框
        .srh_inp {
          flex: 1;
          border: none;
          outline: none;
          color: #333;
          appearance: none;
          font-size: .14rem;
          margin-left: .15rem;
          padding-left: .35rem;
          border-radius: .2rem;
          background: #F6F6F6;
          -webkit-appearance: none;
          &::-webkit-search-cancel-button {
            display: none;
          }
        }
        // 搜索 按钮
        .pop_cfm {
          color: #999;
          font-size: .14rem;
          margin: 0 .15rem 0 .12rem;
        }
        // 返回 按钮
        .pop_cancel {
          color: #fc3c3c;
        }
        // 搜索icon
        .icon {
          top: 50%;
          z-index: 1;
          left: .25rem;
          width: .14rem;
          height: .16rem;
          fill: #2d2d2d;
          position: absolute;
          transform: translate(0, -50%);
        }
        // 清除icon
        .clear_icon {
          top: 50%;
          right: .64rem;
          width: .18rem;
          height: .18rem;
          display: block;
          font-size: .12rem;
          line-height: .3rem;
          text-align: center;
          position: absolute;
          transform: translate(0, -50%);
        }
      }
      .search_filter {
        left: 0;
        bottom: 0;
        top: .49rem;
        width: 100%;
        z-index: 100;
        font-size: .14rem;
        position: absolute;
        overflow: hidden;
        .layer {
          opacity: .5;
          height: 100%;
          background: #000;
        }
      }
    }
    .title{
      font-size: .14rem;
      padding: .1rem .05rem;
      color: #696969;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      .duration{
        flex: 1;
        padding-right: .5rem;
        .r-picker{
          padding: .10rem 0;
        }
      }
      .group-container{
        flex: 1;
        display: flex;
        .group-button{
            padding: .03rem;
            border: .05em solid #ddd;
            flex: 1;
          }

        .activeGroup{
          color: red;
          border: .05em solid;
        }
      }

      .vux-flex-row{
          .vux-flexbox-item{
            .flex-demo{
              p{
                font-size: .12rem;
                //text-align: right;
              }
            }
          }
        }

       
    }
    .title2{
      font-size: .14rem;  
      padding: .05rem;
    }
    /* 头部 */
    .header {
      display: flex;
      justify-content: space-between;
      padding: .05rem .15rem;
      width: 100%;
      height: .35rem;
      line-height: .25rem;
      box-sizing: border-box;
      .title-form{
        font-size: .14rem;
        width: 50%;
        // text-decoration:underline
        // font-weight: bold;
      }
    }
    /* 顶部期初、期末 */
    .swiper-container-header {
      margin: 0;
      width: 50%;
      height: 100%;
      text-align: right;
      font-size: .14rem;
    }

    .scroll-container {
      height: calc(100% - .9rem);
      font-size: 0;
    }
    /deep/ .scroll-wrapper {
      display: flex;
    }
    .part-left {
      .left-header{
        height: .5rem;
        text-align: center;
        line-height: .5rem;
        background-color: #eee;
        border-right: 1px solid #fff;
      }
    }
    .part-left, .part-right {
      width: 50%;
      font-size: .14rem;

      .content-item {
        position: relative;
        padding: 0rem .1rem;
        width: 100%;
        line-height: .20rem;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;

        .groupName{

        }

        .groupCode{
          font-size: 12px;
          color: #999999;
        }

        /* 标题 */
        .title {
          padding: .05rem .15rem;
          min-height: .4rem;
          line-height: .3rem;
          font-size: .16rem;
          font-weight: bold;
          box-sizing: border-box;
        }

        /* 资产合计 */
        &.final-total {
          line-height: .3rem;
          font-size: .14rem;
          font-weight: bold;
        }

        /* 利润表首行 */
        &.is-first {
          line-height: .3rem;
          font-size: .2rem;
          font-weight: bold;
        }
      }
    }
    .part-left {
      .bg-color{
        background-color: #eee;
      }
      .title {
        position: relative;
      }
      .content-item {
        &.is-first {
          &:before {
            @extend %border-1px;
            top: 0;
          }
          &:after {
            @extend %border-1px;
            bottom: 0;
          }
        }
        &.indent {
          padding-left: 3em;
        }
      }
    }
    .swiper-container {
      margin: 0 auto;
      position: relative;
      overflow: hidden;
      list-style: none;
      padding: 0;
      z-index: 1;
      .swiper-wrapper {
        .swiper-slide {
          width: 100%;
          .right-list{
            // padding-top: .46rem;
          }
          .right-header{
            height: .5rem;
            text-align: center;
            line-height: .25rem;
          }
          .parent-title{
            text-align: center;
            background-color: #eee;
            font-weight: 700;
          }
          .children-title{
            display: flex;
            justify-content: space-between;
            span{
              text-align: center;
              width: 50%;
              display: inline-block;
            }
            .init{
              background-color:#d9e1f2;
              color: #305496;
            }
            .debit{
              background-color:#bdd7ee;
              color: #4a97c8;  
            }
            .credit{
              background-color: #fce4d6;
              color: #ff0000;
            }
            .bl{
              background-color:#e2efda;
              color: #548235;  
            }
          }
        }
      }
    }
    .part-right {
      text-align: right;
      .bg-color{
        background-color: #eee;
      }
      .content-item {
        padding-left: 0;
        display: flex;
        justify-content: space-between;
        font-weight: 700;
        span{
          text-align: right;
          flex: 1;
          display: inline-block;
          line-height: .4rem;
        }
      }
    }
    /* 1px边框 */
    .border-1px-t {
      &:before {
        @extend %border-1px;
        top: 0;
      }
    }
    .border-1px-b {
      &:after {
        @extend %border-1px;
        bottom: 0;
      }
    }
  }
</style>
