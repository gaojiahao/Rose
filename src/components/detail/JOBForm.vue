<template>
  <div class='pages'>
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
  import {getJobList} from 'service/Directorys/jobService'
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
@import './../scss/bizDetail';
</style>


