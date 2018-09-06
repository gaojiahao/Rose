<template>
  <div class='pages related_apply'>
    <div class="big_title">
      <p class="vux-1px-b">相关实例</p>
    </div>
    <div class="relevant_list">
      <div class="each_app vux-1px-b" v-for='(item,index) in RelatedAppList' :key="index" @click="getRelatedData(item)">
        <div class="app_info">
          <div class="title">业务应用</div>
          <div class="app_name">
            <span>{{item.listName}}</span>
          </div>
          <div class="msg_num">
            {{item.itemCount}}
            <span class="msg_tx">关联</span>
          </div>
          <div class="r_arrow" v-if='item.itemCount>0'>
            <x-icon type="ios-arrow-right" size="20" ></x-icon>
          </div>
        </div>
      </div>
    </div>
    <pop-related-list :show='showPop' :listId='listId' :filter='filtersData' v-model='showPop' ref='relatedList'></pop-related-list>
  </div>
  
</template>

<script>
import PopRelatedList from 'components/Popup/PopRelatedList'
import {getAppExampleDetails} from 'service/detailService.js'
import businessMap from '@/home/pages/maps/businessApply.js'
export default {
  data(){
    return{
      showPop : false,
      listId : '',
      transCode : '',
      filtersData : [],
      RelatedAppList :[],
      activeIndex : -1,
    }
  },
  components:{
    PopRelatedList
  },
  methods:{
    //显示相关实例的pop
    getRelatedData(item){
      if(item.itemCount>0){
        this.listId = item.listId;
        item.content.forEach(val=>{
          this.filtersData.push(val.transCode);
        })
        this.$HandleLoad.show();
      }
    },
    //TODO 获取相关实例
    getAppExampleDetails(){
       return getAppExampleDetails({
        transCode :this.transCode,
        listId :this.listId
      }).then(data=>{
        let relatedApply = data.relevantItems;
        relatedApply.forEach(item=>{
          if(businessMap[item.listName]){
           this.RelatedAppList.push(item);
          }
        })
      })
    },
  },
  created(){
    this.$loading.show()
    this.listId = this.$route.params.listId;
    this.transCode = this.$route.query.transCode;
    this.getAppExampleDetails().then(()=>{
      this.$loading.hide();
    });
  }

}
</script>

<style lang="scss" scoped>
  .vux-1px-b:after{
    border-color: #e8e8e8;
  }
  .related_apply{
    background: #fff;
  }
  .big_title {
    width: 95%;
    color: #111;
    margin: 0 auto;
    padding: .04rem;
    font-size: .3rem;
    font-weight: 300;
    box-sizing: border-box;
  }
  // 相关应用
  .relevant_list {
    width: 90%;
    margin: 0 auto;
    .each_app {
      margin-bottom: .1rem;
      position: relative;
      border-radius: .08rem;
      .app_info {
        padding: .1rem;
        box-sizing: border-box;
        .title {
          color: #4F90F9;
          font-size: .12rem;
          font-weight: bold;
        }
        .app_name {
          font-size: .18rem;
          .msg_count {
            float: right;
            margin-right: .1rem;
          }
        }
        .msg_num {
          color: #3f72af;
          font-size: .2rem;
          .msg_tx {
            // color: #757575;
            font-size: .12rem;
          }
        }
        .r_arrow {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translate(0, -50%);
        }
      }
    }
  }

</style>

