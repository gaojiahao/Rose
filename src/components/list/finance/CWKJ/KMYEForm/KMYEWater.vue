<template>
  <div v-transfer-dom>
    <popup class="water_wrapper" v-model="showWater" height="100%" width="100%" position="right">
        <div class="pop-header">
          <div class="header-container">
            <i class="icon icon-return" @click="goBack"></i>
            <span class="header-title">科目余额流水明细</span>
          </div>
        </div>
        <div class="water-detail">
           <div class="water-detail-item">
            <span>{{waterData.treecolumn}}</span>
            <span :style="{textAlign:'right',display:'inline-block'}"></span>
          </div>
          <div  class="water-detail-item">
            <span>会计期间：{{`${dateList.startDate} ~ ${dateList.endDate}`}}</span>
          </div>
         
          <div  class="water-detail-item">
            <div :style="{color:'#09bb07'}">
              <div >借方</div>
              <div >{{waterHeaderData.dr | formatNum}}</div>
            </div>
            <div :style="{color:'#e60000'}">
              <div >贷方</div>
              <div >{{waterHeaderData.cr | formatNum}}</div>
            </div>
             <div :style="{color:'#353535'}">
              <div>余额</div>
              <div>{{waterHeaderData.balance | formatNum}}</div>
            </div>
          </div>
        </div>
        <r-scroll :options="scrollOptions" class="water-scroll" ref="bScroll">
          <div class="water-content">
            <div class="water-list" v-for="(item,index) of waterListData" :key="index">
              <div class="water-list-date">{{item.date}}</div>
              <div 
                class="water-list-detail" 
                v-for="(list,listdex) of item.list" 
                :key="listdex"
                @click="gotoForm">
                <div class="detail-left" v-if="list.summary!='本日合计'">
                  <img :src="getDefaultImg()"/>
                  <div style="margin-left:.1rem;">
                    <p>{{list.summary}}</p>
                    <span class="detail-left-transCode">{{list.transCode}}</span>
                  </div>
                </div>
                <div class="detail-right"  v-if="list.summary!='本日合计'">
                  <p v-if="!!list.dr" class="detail-right-transNum">+{{list.dr | formatNum}}</p>
                  <p v-else  class="detail-right-transNum">-{{list.cr | formatNum}}</p>
                  <span class="detail-right-balance">余额：{{list.balance | formatNum}}</span>
                </div>
              </div>
            </div>
          </div>
        </r-scroll>
    </popup>
  </div>
</template>

<script>
  import { getAccountBalance } from 'service/kmService'
  import RScroll from 'plugins/scroll/RScroll'
  import {toFixed} from '@/plugins/calc'
  import {numberComma,Datetime,dateFormat,Popup} from 'vux'

  export default {
    name: "LRForm",
    data() {
      return {
        showWater: false,
        waterListData: [
          {date:'2020年6月23日',list:[
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'通用收款',transCode:'YUN5264832',debit:2000,balance:1000},
            {img:require('assets/wl_default03.png'),title:'付供应商预付款',transCode:'YUN5264832',debit:2000,balance:1000}
          ]}
        ],
        waterHeaderData: {},
        scrollOptions: {
          click: true,
          bounce: {
            top: false
          }
        }
      }
    },
    components: {
      RScroll,
      Datetime,
      Popup
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
      },
      waterData: {
        type: Object,
        default: {}
      },
      dateList: {
        type: Object,
        default: {}
      }
    },
    watch: {
      showWater: function(val){
        if(val){
          this.getWaterData();
        }
      }
    },
    methods: {
      goBack() {
        this.showWater = false;
      },
      gotoForm(){
        
      },
      getWaterData(){
        getAccountBalance(
          this.dateList.startDate,
          this.dateList.endDate,
          this.waterData.financeAccountCode,
          this.waterData.objectType,
          this.waterData.objectCode).then(res => {
            this.waterListData = this.createData(res.data);
          });
      },
      createData(data){
        let waterUnique = [],
            waterData = [];
        data.forEach(item => {
          if(waterUnique.indexOf(item.date) < 0 && !!item.date){
            waterUnique.push(item.date);
          }
          if(item.summary === '本期合计'){
            this.waterHeaderData = item;
          }
        })
        waterUnique.forEach((unique,index) => {
          waterData.push({
            date: unique,
            list: []
          });
          data.forEach(list => {
            if(unique === list.date){
              waterData[index].list.push(list)
            }
          })
        })
        return waterData;
      },
      // 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
    },
    filters: {
      // 格式化数字
      formatNum(num) {
        if (!num) return '0.00';
        return `${numberComma(num.toFixed(2))}`;
      }
    }
  }
</script>

<style scoped lang="scss">
  .water_wrapper{
    height: 100%;
    overflow: hidden;
    background-color: #fff;
    z-index: 1000;
    .pop-header{
      width: 100%;
      height: .4rem;
      background-color: rgb(50, 150, 250);
      color: #FFF;
      .header-container{
        position: relative;
        .icon {
          position: absolute;
          top: .1rem;
          z-index: 1;
          left: .10rem;
          width: .14rem;
          height: .2rem;
        }
        .header-title{
          position: absolute;
          top: .07rem;
          left: .4rem;
        }
      }
    }
    .water-detail{
      border-bottom: 1px solid #ddd;
      &-item{
        padding: .02rem .1rem;
        display: flex;
        justify-content: space-between;
        text-align: center;
      }
    }
    .water-scroll{
      overflow: hidden;
      height: 100%; 
      height: calc(100% - 1rem);
      margin-bottom: .25rem;
      .water-content{
        .water-list{
          margin-top: .02rem;
          font-size: .14rem;
          &-date{
            background-color: #d9d9d9;
            padding: .5em .1rem;
          }
          &-detail{
            display: flex;
            justify-content: space-between;
            margin-top: .05rem;
            padding: 0em .1rem;
            .detail-left{
              display: flex;
              &-transCode{
                color: #999999;
                font-size: .12rem;
              }
              img{
                width: .45rem;
                height: .45rem;
              }
            }
            .detail-right{
              text-align: right;
              &-balance{
                color: #999999;
                font-size: .12rem;
              }

              &-transNum{
                font-weight: bold;
              }
            }
          }
        }
        .water-list-detail:hover{
          background-color: #ddd;
        }
      }
    }
  }
</style>
