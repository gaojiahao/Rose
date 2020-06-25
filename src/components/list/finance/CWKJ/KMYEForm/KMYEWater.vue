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
          <div>
            <span>会计期间：{{`${dateList.startDate} - ${dateList.endDate}`}}</span>
          </div>
          <div>
            <span>{{waterData.treecolumn}}</span>
            <span :style="{width:'30%',textAlign:'right',display:'inline-block'}">余额：1000</span>
          </div>
          <div>
            <span>收入：30000</span>
            <span>支出：20000</span>
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
                <div class="detail-left">
                  <img :src="getDefaultImg()"/>
                  <div style="margin-left:.1rem;">
                    <p>{{list.summary}}</p>
                    <span>{{list.transCode}}</span>
                  </div>
                </div>
                <div class="detail-right">
                  <p v-if="!!list.dr">+{{list.dr | formatNum}}</p>
                  <p v-else>-{{list.cr | formatNum}}</p>
                  <span>余额：{{list.balance | formatNum}}</span>
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
        if (!num) return '-';
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
      div{
        padding: .02rem .1rem;
        display: flex;
        justify-content: space-between;
      }
    }
    .water-scroll{
      overflow: hidden;
      height: 100%; 
      height: calc(100% - 1rem);
      margin-bottom: .25rem;
      .water-content{
        padding: .1rem;
        .water-list{
          margin-top: .02rem;
          &-detail{
            display: flex;
            justify-content: space-between;
            margin-top: .05rem;
            .detail-left{
              display: flex;
              img{
                width: .6rem;
                height: .6rem;
              }
            }
            .detail-right{
              text-align: right;
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
