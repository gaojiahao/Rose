<template>
  <div class='pages '>
    <div class='detail_content'>
      <div class='each_property vux-1px-b'>
        <label>职位名称:</label>
        <div class='property_val'>{{jobInfo.name}}</div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>职位类型:</label>
        <div class='property_val'>
           {{jobInfo.type}}
        </div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>创建人:</label>
        <div class='property_val'>{{jobInfo.creator}}</div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>创建时间:</label>
        <div class='property_val'>{{jobInfo.crtTime}}</div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>职位状态:</label>
        <div class='property_val'>{{jobInfo.status}}</div>
      </div>
    </div>
  </div>
</template>
<script>
  import {getJobList} from 'service/listService.js'
  export default {
    data() {
      return {
        jobInfo : {},
        jobId:''
      }
    },
    methods: {
      //职位信息
      findData() {
        return getJobList({
          filter: JSON.stringify([{operator:"eq",value:this.jobId,property:"id"}])
        }).then(({tableContent = []}) => {
          tableContent.forEach(item => {
            switch (item.type) {
              case 'Y':
                item.type = '营销类';
                break;
              case 'Z':
                item.type = '专业类';
                break;
              case 'J':
                item.type = '技术类';
                break;
              case 'C':
                item.type = '操作类';
                break;
              case 'M':
                item.type = '管理类';
                break;
                
            }
            switch (item.status) {
              case 1:
                item.status = '使用中';
                break;
              case 2:
                item.status = '未使用';
                break;
              case 3:
                item.status = '草稿';
                break;
              case -1:
                item.status = '停用';
                break;
            }
          })
          this.jobInfo = tableContent[0];
          this.$loading.hide();
        }).catch(e=>{
          this.$loading.hide();
          this.$vux.alert.show({
            content:e.message
          })
        });
      },
    },
    created() {
      this.$loading.show()
      let query = this.$route.query;
      if(query.id){
        this.jobId = query.id;
          this.findData()
      }
    }
  }
</script>
<style lang="scss" scoped>
  .vux-1px-l:before,
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }
  .detail_content {
    height: 100%;
    overflow-y: auto;
    background-color: #fff;
    div {
      border: none;
      outline: none;
    }
    .each_property {
      min-height: .5rem;
      padding: 0.05rem 0.08rem;
      position: relative;
      label {
        color: #6d6d6d;
        font-size: 0.12rem;
        display: block;
        height:0.2rem;
        line-height: 0.2rem;
      }
      .property_val {
        display: block;
        font-size: 0.16rem;
        line-height: 0.24rem;
      }
    }
  }
  // 确定
  .btn {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 10%;
    position: fixed;
    background: #fff;
    .cfm_btn {
      top: 50%;
      left: 50%;
      width: 2.8rem;
      color: #fff;
      height: .44rem;
      line-height: .44rem;
      position: absolute;
      text-align: center;
      background: #5077aa;
      border-radius: .4rem;
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 5px #5077aa;
    }
  }

</style>


