<template>
  <div class="list-item">
    
    <div class="trans-info">
        <template v-for="(field,index) in transField">
          <div class="trans-item" :key="index"  v-bind:class="{'bi-status': field.fieldCode==='biStatus'}">
            <span v-if="field.fieldCode!=='biStatus'">{{item[field.fieldCode]}}</span>
            <span v-if="field.fieldCode==='biStatus'" v-instanceStateDirective="{status:item[field.fieldCode]}" >{{item[field.fieldCode]}}</span>
          </div>
        </template>
    </div>
    
    <div class="main-info">
      <div class="main-single">
        <template v-for="(field,index) in singleField" >
            <div :key="index" class="main-single-item" >
              <span >{{field.alias ? field.alias : field.fieldName}}</span>
              <span>{{item[field.fieldCode]}}</span>
            </div>
        </template>
      </div>

      <div class="main-multiple">
        <div v-for="(detail,didx) in item.detailItem" :key="didx"  class="main-multiple-item">

          <div class="main-multiple-item-piccontain">
            <img class="matter_img"  alt="mater_img" :src="getMatterDefault()" style="width: 0.85rem;">
          </div>

          <div :key="didx" >

            <template v-for="(field,index) in multipleField">
              <div :key="index" v-if="index<5">
                <span >{{field.alias ? field.alias : field.fieldName}}</span>
                <span>{{detail[field.fieldCode]}}</span>
              </div>
            </template>

            <template v-for="(field,index) in summaryField">
              <div :key="1+'-'+index" class="summary-item" >
                <span class="summary-item-label">{{field.alias ? field.alias : field.fieldName}}</span>
                <span class="summary-item-value">{{detail[field.fieldCode]}}</span>
              </div>
            </template>

          </div>
          </div>
      </div>
    </div>

    <div class="summary-info" v-if="item.detailItem.length">
      <div class="summary-info-count" >
        共{{item.detailItem.length}}条明细
      </div>
      <div>
        <template v-for="(field,index) in summaryField">
          <div class="summary-item" :key="index">
            <span class="summary-item-label">{{field.alias ? field.alias : field.fieldName}}：</span>
            <span class="summary-item-value">{{numberCommaNumer(summaryValue[field.fieldCode])}}</span>
          </div>
        </template>
      </div>
    </div>

    <div class="base-info">
        <template v-for="(field,index) in baseField">
          <div class="base-item" :key="index">
            <span >{{field.alias ? field.alias : field.fieldName}}：</span>
            <span>{{item[field.fieldCode]}}</span>
          </div>
        </template>
    </div>

  </div>
</template>
<script>
import Vue from "vue";
import { numberComma} from 'vux'
export default Vue.component("ListItem", {
  props: ["fieldsObj", "item"],
  computed:{
    summaryField:function(){
      return this.fieldsObj.filter(it=>{
        return it.isSummary;
      });
    },
    mainField:function(){
      let sysFieldCode = [
        'handlerUnitName',
        'handlerRoleName',
        'handlerName',
        'modTime',
        'modiferName',
        'crtTime',
        'effectiveTime',
        'creatorName',
        'transCode',
        'biStatus'];
      return this.fieldsObj.filter(it=>{
        return !it.isSummary;
      }).filter(it=>{
        return !sysFieldCode.includes(it.fieldCode);
      })
    },
    singleField:function(){
      var val = [];
      for(var key in this.item){
        if(key!= 'detailItem'){
          val.push(key);
        }
      }
      return this.mainField.filter(it=>{
        return val.includes(it.fieldCode);
      });
    },
    multipleField:function(){
      var val = [];
      for(var key in this.item){
        if(key!= 'detailItem'){
          val.push(key);
        }
      }
      return this.mainField.filter(it=>{
        return !val.includes(it.fieldCode);
      });
    },
    baseField:function(){
      let baseField = ['handlerName','modTime'];
      return this.fieldsObj.filter(it=>{
        return baseField.includes(it.fieldCode);
      })
    },
    transField:function(){
      return [
        {fieldCode:'transCode',fieldName:"交易号",isSummary:false},
        {fieldCode:'biStatus',fieldName:"表单状态",isSummary:false}
        ]
    },
    summaryValue:function(){
      let val = {};
      this.summaryField.map(it=>{
        this.item.detailItem.map(d=>{
          if(val[it.fieldCode]){
            val[it.fieldCode] +=   Number(d[it.fieldCode]);
          }else{
            val[it.fieldCode] = Number(d[it.fieldCode]);
          }
        });
      });
      return val;
    }
  },
  methods:{
    numberCommaNumer(v){
      return numberComma(v);
    },
    //选择默认图片
    getMatterDefault() {
      let url = require('assets/wl_default03.png');
      return url
    },
  },
});
</script>
<style lang="scss">
.list-item {
  color: #333;
  overflow: hidden;
  font-size: 0.12rem;
  background: #fff;
  position: relative;
  margin: 0.15rem 0.1rem;
  border-radius: 0.04rem;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 0.1rem  0rem;
  -webkit-transition: background-color 200ms linear;
  -o-transition: background-color 200ms linear;
  transition: background-color 200ms linear;
  -webkit-box-shadow: 0 2px 10px 0 rgba(232, 232, 232, 0.7);
  box-shadow: 0 2px 10px 0 rgba(232, 232, 232, 0.7);
  line-height: 0.22rem;

  .trans-info{
    padding: 0.03rem 0.10rem;
    display: flex;
    justify-content: space-between;
    .trans-item{

    }
    .bi-status{
      span{
        color: white;
        padding: 0.02rem 0.04rem;
        border-radius: 0.10rem;
      }
    }
  }

  .main-info{
    border-bottom: 0.01rem solid #ddd;
    padding: 0.03rem 0.10rem;
    
    .main-single{
      &-item{
        display:flex;
        justify-content: space-between;
      }
    }

    .main-multiple{
      &-item{
        display: flex;
        margin-bottom: 0.08rem;
        &-piccontain{
          margin: 0rem 0.05rem 0 0;
        }
      }
    }
  }
  .summary-info{
    border-bottom: 0.01rem solid #ddd;
    padding: 0.03rem 0.10rem;
    display: flex;
    justify-content: space-between;
    &-count{
      font-weight: bold;
      color: #605a5a;
    }
    .summary-item{
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      &-label{
        color: #605a5a;
      }
      &-value{
        color: #FF5722
      }
    }
    
  }
  .base-info{
    padding: 0.03rem 0.10rem;
    .base-item{
      display: inline-block;
      margin-right: 0.10rem;
    }
  }
  span:nth-child(2n + 1) {
    color: #aaa;
  }
  span:nth-child(2n) {
    font-size: 0.13rem;
  }
  &.vux-1px-b:after {
    border-color: #e8e8e8;
  }
  &.vux-1px-b:last-child:after {
    border: none;
  }
  .show-more {
    text-align: right;
    color: blue;
  }
  .icon-more {
    display: inline-block;
    width: 0.2rem;
    height: 0.04rem;
  }
  .item {
    display: inline-flex;
    margin-right: 0.2rem;
  }
}
.r-row:first-child {
  margin-top: 0rem;
}
.r-row:last-child {
  margin-bottom: 0rem;
}
</style>

