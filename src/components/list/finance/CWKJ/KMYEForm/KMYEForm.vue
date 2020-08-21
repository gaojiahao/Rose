<template>
  <div class="detail_wrapper">
    <div class="form-search">
      <!-- <x-input ref="formSearch" placeholder="搜索" v-model="searchValue"></x-input> -->
       <div class='search'>
        <form class="search_part" :class="'has-filter'" action="">
          <i class="icon icon-search"></i>
          <input ref="searchInp" class="srh_inp" type="search" autocomplete="off"
                placeholder="搜索"  v-model='searchValue'>
          <div class="pop_cfm"></div>
          <i class="icon-clear clear_icon" @click="clearSearch"></i>
        </form>
      </div>
    </div>
    <div class="date-range">
        <div class="date-period">会计期间</div>
        <div>
          <span class="start-date">
            <datetime
              v-model="startDate"
              format="YYYY-MM-DD"
              @on-change="startDateChange">
            </datetime>
          </span>
        </div>
        <div>
          <span>至</span>
        </div>
        <div>
          <span class="end-date">
            <datetime
              v-model="endDate"
              format="YYYY-MM-DD"
              @on-change="endDateChange">
            </datetime>
          </span>
        </div>
    </div>
    <load-more :tip="'加载中'" v-if="noData"></load-more>
    <r-scroll :options="scrollOptions" ref="bScroll">
      <div class="part-left">
        <div class="title-form">科目</div>
        <div class="title-list">
          <div v-for="(item, index) in listData" :key="index">
            <div class="content-item" ref="partLeft" @click.stop="onItemClick(item)">
                <!-- {{item.treecolumn}} -->
                <p>{{item.financeAccountName}}</p>
                <p class="groupCode">{{item.financeAccountCode}}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="swiper-container part-right">
        <div class="swiper-wrapper box">
          <div class="swiper-slide">
            <div class="right-header">
              <p class="parent-title">{{headInfo.firstPeriod}}</p>
              <p class="children-title">
                <span class="debit">借方</span>
                <span class="credit">贷方</span>
              </p>
            </div>
            <div class="right-list">
              <div v-for="(item, index) in listData" :key="index">
                <div class="content-item" ref="partRightInit">
                    <span>{{item.initDr | formatNum}}</span>
                    <span>{{item.initCr | formatNum}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-slide">
            <div class="right-header">
              <p class="parent-title">{{headInfo.currentPeriod}}</p>
              <p class="children-title">
                <span class="debit">借方</span>
                <span class="credit">贷方</span>
              </p>
            </div>
            <div class="right-list">
              <div v-for="(item, index) in listData" :key="index">
                <div class="content-item" ref="partRightFinal">
                    <span>{{item.dr | formatNum}}</span>
                    <span>{{item.cr | formatNum}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-slide">
            <div class="right-header">
              <p class="parent-title">{{headInfo.currentYear}}</p>
              <p class="children-title">
                <span class="debit">借方</span>
                <span class="credit">贷方</span>
              </p>
            </div>
            <div class="right-list">
              <div v-for="(item, index) in listData" :key="index">
                <div class="content-item" ref="partRightYear">
                    <span>{{item.thisYearDr | formatNum}}</span>
                    <span>{{item.thisYearCr | formatNum}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-slide">
            <div class="right-header">
              <p class="parent-title">{{headInfo.lastPeriod}}</p>
              <p class="children-title">
                <span class="debit">借方</span>
                <span class="credit">贷方</span>
              </p>
            </div>
            <div class="right-list">
              <div v-for="(item, index) in listData" :key="index">
                <div class="content-item" ref="partRightYear2">
                    <span>{{item.finalDr | formatNum}}</span>
                    <span>{{item.finalCr | formatNum}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </r-scroll>
    <KMYEpopup
      v-if="isShow"
      ref="KMYEpopup" 
      :listData="popData" 
      :dateList="dateList"
      :transcode="transcode" 
      :folder="folder" 
      :name="name">
    </KMYEpopup>
  </div>
  
</template>

<script>
  import { getAccountBalance } from 'service/kmService'
  import RScroll from 'plugins/scroll/RScroll'
  import {toFixed} from '@/plugins/calc'
  import {numberComma,Datetime,dateFormat,XInput,LoadMore} from 'vux'
  import KMYEpopup from './KMYEPopup'
  export default {
    name: "LRForm",
    data() {
      return {
        isShow:false,
        endDate: '',
        startDate: '',
        searchValue: '',
        headerSwiper: null,         // 顶部swiper
        partRightSwiper: null,      // 右侧金额swiper
        code: '',  
        localCurrency: "",                 // 路由参数
        headInfo:{}, 
        dateList: {},               // 表头信息
        listData: [],
        popData: {},
        listMap: {
          KMYE: {
            title: '科目余额表',
            firstPeriod: '期初金额',
            currentPeriod: '本期发生额',
            currentYear: '本年累计',
            lastPeriod: '期末余额',
            request: getAccountBalance
          }
        },
        scrollOptions: {
          click: true,
          bounce: {
            top: false
          }
        },
        noData:true,
      }
    },
    components: {
      RScroll,
      Datetime,
      KMYEpopup,
      XInput,
      LoadMore
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
    watch: {
      searchValue: function(value) {
        let searchData = [];
        if(value !== ''){
          JSON.parse(this.copyData).forEach(item => {
            if(item.treecolumn.indexOf(value) > -1){
              searchData.push(item);
            }
          })
          this.listData = searchData;
        }else{
          this.listData = JSON.parse(this.copyData);
        }
        this.$nextTick(() => {
            // 设置金额行高度，判断高度是否与title相同，不相同则设置为title的高度
            this.setHeight(
              this.$refs.partLeft, 
              this.$refs.partRightInit, 
              this.$refs.partRightFinal);
          })
      }
    },
    methods: {
      endDateChange(value){
        if(new Date(value).getTime() <= new Date(this.startDate).getTime()){
          this.$vux.toast.show({
              type: 'warn',
              text: '截止日期不可小于开始日期！'
          });
          return;
        }
        this.getData();
      },
      startDateChange(value){
        if(new Date(value).getTime() >= new Date(this.endDate).getTime()){
          this.$vux.toast.show({
              type: 'warn',
              text: '开始日期不可大于截止日期！'
          });
          return;
        }
        this.getData();
      },
      onItemClick(item){
        if(item.children.length === 0) return;
        this.isShow = true;
        this.popData = item;
        this.dateList["startDate"] = this.startDate;
        this.dateList["endDate"] = this.endDate;
        this.$nextTick(() => {
          this.$refs["KMYEpopup"].showPop = true;
        })
      },
      // 获取资产负债表数据
      getData() {
        this.listMap[this.code].request(this.startDate,this.endDate).then(res => {
          let {data = []} = res;
          this.listData = this.createData(data);
          this.copyData = JSON.stringify(this.listData);
          this.noData = false;
          this.$nextTick(() => {
            // 设置金额行高度，判断高度是否与title相同，不相同则设置为title的高度
            this.setHeight(
              this.$refs.partLeft, 
              this.$refs.partRightInit, 
              this.$refs.partRightFinal);
          })
        })
      },
      createData(data) {
          let ret = this.groupData(data, ['financeAccountCode', 'objectType'], 'objectName');
          ret = this.groupData(ret, 'financeAccountCode', 'objectType', 'financeAccountName');
          return ret;
      },
      createParentNode() {
        return {
            treecolumn: '',
            cr: 0,
            dr: 0,
            thisYearCr: 0,
            thisYearDr: 0,
            finalDr: 0,
            finalCr: 0,
            initDr: 0,
            initCr: 0,
            iconCls: '',
            children: []
        };
      },
      groupData(data, groupField, titleField, groupTitleField) {
          let me = this, ret = {}, key, dataMaping = [];
          data.forEach(function (it, i) {
              it.rowSum = it.initDr + it.initCr + it.cr + it.dr + it.thisYearCr + it.thisYearDr + it.finalDr + it.finalCr;
              key = Array.isArray(groupField) ? (it[groupField[0]] + it[groupField[1]]) : it[groupField];
              if (key) {
                  if (!ret[key]) {
                      ret[key] = me.createParentNode();
                      me.applyIf(ret[key], it);
                      ret[key].treecolumn = key + (groupTitleField ? (" - " + it[groupTitleField]) : '');
                  }
                  ret[key].initDr += it.initDr;
                  ret[key].manageAccount = it.manageAccount;
                  ret[key].financeAccountCode = it.financeAccountCode;
                  ret[key].initCr += it.initCr;
                  ret[key].cr += it.cr;
                  ret[key].dr += it.dr;
                  ret[key].thisYearCr += it.thisYearCr;
                  ret[key].thisYearDr += it.thisYearDr;
                  ret[key].finalDr += it.finalDr;
                  ret[key].finalCr += it.finalCr;
                  ret[key].sort = it.sort;
                  ret[key].rowSum = ret[key].initDr + ret[key].initCr + ret[key].cr + ret[key].dr + ret[key].thisYearCr + ret[key].thisYearDr + ret[key].finalDr + ret[key].finalCr;
                  if (!!it[titleField]) {
                      it.treecolumn = it[titleField];
                      ret[key].children.push(it);
                  }
                  it.showDetail = it.leaf = it.children && it.children.length ? false : true;
              } else {
                  dataMaping.push(it);
              }
          });
          Object.keys(ret).forEach(function (key) {
              ret[key].initDr = ret[key].initDr - ret[key].initCr;
              ret[key].initDr > 0 ?
                  (ret[key].initCr = 0) :
                  (ret[key].initCr = 0 - ret[key].initDr, ret[key].initDr = 0);
              ret[key].finalDr = ret[key].finalDr - ret[key].finalCr;
              ret[key].finalDr > 0 ?
                  (ret[key].finalCr = 0) :
                  (ret[key].finalCr = 0 - ret[key].finalDr, ret[key].finalDr = 0);

              dataMaping.push(ret[key]);
          });
          return dataMaping;
      },
      applyIf(o, n) {
            let p;
            if (o) {
                for (p in n) {
                    if (o[p] === undefined) {
                        o[p] = n[p]
                    }
                }
            }
            return o;
        },
      // 设置高度
      setHeight(left,rightInit,rightFinal) {
        let right = [rightInit,rightFinal];
        let right2 = [rightInit,rightFinal];
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
      // 初始化swiper
      initSwiper() {
        this.$nextTick(() => {
          this.partRightSwiper = new this.Swiper('.part-right',{
          slidesPerView : 'auto',
          longSwipersRadio: 0.9,
          freeMode: true,
          });
          this.partRightSwiper.controller && (this.partRightSwiper.controller.control = this.headerSwiper);
        })
      },
      clearSearch(){
        this.searchValue = '';
      }
    },
    filters: {
      // 格式化数字
      formatNum(num) {
        if (!num) return '-';
        return `${numberComma(num.toFixed(2))}`;
      }
    },
    created() {
      let {trancode = ''} = this.$route.query;
      this.code = this.transcode;
      //获取表格的表头信息
      this.headInfo = { ...this.listMap[this.transcode] };
      this.startDate = `${new Date().getFullYear()}-01-01`;
      this.endDate = dateFormat(new Date(), 'YYYY-MM-DD');
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
    .form-search{
      background-color: #fff;
      border-bottom: 1px solid #ddd;
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
            padding-left: .15rem;
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
            right: .4rem;
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
    }
    .date-range{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding-left: .1rem;
      .start-date{
        display: inline-block;
      }
      .end-date{
        display: inline-block;
      }
    }
    .weui-loadmore {
      width: 65%;
      margin: 1.5em auto;
      line-height: 1.6em;
      font-size: 14px;
      text-align: center;
      z-index: 999;
      height: calc(100% - .76rem);
    }
    /* 顶部期初、期末 */
    .swiper-container-header {
      margin: 0;
      width: 50%;
      height: 100%;
      text-align: right;
      font-size: .14rem;
    }

   .scroll-wrapper {
      height: calc(100% - .76rem);
      font-size: 0;
    }
    /deep/ .scroll-content {
      display: flex;
    }
    .part-left, .part-right {
      width: 50%;
      font-size: .14rem;

      .content-item {
        position: relative;
        padding: .05rem .15rem;
        width: 100%;
        line-height: .25rem;
        box-sizing: border-box;
        /* 标题 */
        .title {
          padding: .05rem .15rem;
          min-height: .4rem;
          line-height: .3rem;
          font-size: .16rem;
          font-weight: bold;
          box-sizing: border-box;
        }
        .groupCode{
          font-size: 12px;
          color: #999999;
        }
      }
    }
    .part-left {
      .title-form{
        height: .5rem;
        text-align: center;
        line-height: .5rem;
        background-color: #eee;
        border-right: 1px solid #fff;
      }
      .title-list{
        // padding-top: .46rem;
      }
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
              .debit{
                background-color:#cadbec;
                color: #4b76a0;
              }
              .credit{
                background-color: #f0e4ce;
                color: #c15524;
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
        span{
          text-align: right;
          width: 50%;
          display: inline-block;
          line-height: .6rem;
          font-weight: 700;
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
