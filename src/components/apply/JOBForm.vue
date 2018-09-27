<template>
  <div class='childPage'>
    <div class='content'>
      <div class='each_property vux-1px-b '>
        <label class='required'>职位名称:</label>
        <input type='text' v-model="jobInfo.name" class='property_val'/>
      </div>   
      <r-picker title="职位类型类型:" :data="jobType" :value="jobInfo.type"
                v-model="jobInfo.type" :required='true'>
      </r-picker>
      <r-picker title="使用状态:" :data="jobStatus" :value="jobInfo.status"
               v-model="jobInfo.status" >
      </r-picker>
    </div>
    <!--提交按钮-->
    <div class='vux-1px-t btn '>
      <div class="cfm_btn" @click="save"  v-html="this.$route.query.id?'保存':'提交'"></div>
    </div>
  </div>
</template>
<script>
import { save, update, getJobList } from 'service/Directorys/jobService';
import RPicker from 'components/RPicker';
export default {
  data() {
    return {
      jobInfo: {
        name: "",
        status: "使用中",
        type: "",
      },
      jobType:[//职位类型列表
        {name:'管理类',value:'管理类'},
        {name:'营销类',value:'营销类'},
        {name:'技术类',value:'技术类'},
        {name:'专业类',value:'专业类'},
        {name:'操作类',value:'操作类',status:'C'}
      ],
      jobStatus:[//职位状态列表
        {name:'停用',value:'停用'},
        {name:'未使用',value:'未使用'},
        {name:'使用中',value:'使用中'},
        {name:'草稿',value:'草稿'},
      ],
      jobId:null,//职位id
    }
  },
  components: { RPicker,},
  methods: {
    //提交
    submit(){
      for(let key in this.jobInfo){
        if(typeof(this.jobInfo[key]) === 'string' && this.jobInfo[key].indexOf(' ')>=0){
          this.jobInfo[key] = this.jobInfo[key].replace(/\s/g,'');
        }
      }
      this.$vux.confirm.show({
        content: '确认保存?',
        // 确定回调
        onConfirm: () => {
          //转化职位类型
          switch (this.jobInfo.type) {
            case '营销类':
              this.jobInfo.changeType = 'Y';
              break;
            case '专业类':
              this.jobInfo.changeType = 'Z';
              break;
            case '技术类':
              this.jobInfo.changeType = 'J';
              break;
            case '操作类':
              this.jobInfo.changeType = 'C';
              break;
            case '管理类':
              this.jobInfo.changeType = 'M';
              break;
            
          }
          //转化职位状态
          switch (this.jobInfo.status) {
            case '使用中':
              this.jobInfo.changeStatus = 1;
              break;
            case '未使用':
              this.jobInfo.changeStatus = 2;
              break;
            case '草稿':
              this.jobInfo.changeStatus = 3;
              break;
            case '停用':
              this.jobInfo.changeStatus = -1;
              break;
          }
          let submitData = {
            describe : '',
            name : this.jobInfo.name,
            type : this.jobInfo.changeType,
            status : this.jobInfo.changeStatus
          };
          if(this.jobId){//修改
            submitData.id = this.jobId;
            update(submitData).then( data => {
              if(data.success){
                this.$emit('change', true);
                this.$vux.alert.show({
                  content: data.message,
                  onHide: () => {
                    this.$router.go(-1);
                  }
                })
              }
              else{
                this.$vux.alert.show({
                  content: data.message
                })
              }

            })
          }
          else{//新增
            save(submitData).then(data=>{
              if(data.id){
                this.$emit('change', true);
                this.$vux.alert.show({
                  content:'提交成功',
                  onHide: () => {
                    this.$router.go(-1);
                  }

                })
              }
              else{
                this.$vux.alert.show({
                  content:data.message
                })
              }
            })
          }
        }
      })
    },
    save() {     
      let warn = '';
      let validateMap = [
        {
          key: 'name',
          message: '【职位名称】',
        }, {
          key: 'type',
          message: '【职位类型】',
        }
      ];
      validateMap.every(item => {
        if (this.jobInfo[item.key] === '') {
          warn = `${item.message}不能为空`;
          return false
        }
        return true
      });
      if (warn) {
        this.$vux.alert.show({
          content: warn
        });
        return
      }
      this.submit();     
    },
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
      });
    },
  },
  created() {
    this.$loading.show();
    let query = this.$route.query;
    if(query.id){
      this.jobId = query.id;
      this.findData().then(()=>{
        this.$loading.hide();
      });   
      return  
    }
    this.$loading.hide();

  }
}
</script>
<style lang="scss" scoped>
  .vux-1px-l:before,
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }
  .content {
    height: 90%;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: auto;
    input {
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
      .required{
        color:#5077aa;
        font-weight: bold;
      }
      .property_val {
        display: block;
        font-size: 0.16rem;
        line-height: 0.24rem;
        width:100%;
      }
    }
  }

  // 提交
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
    .disabled{
      background:#c7c7c7;
      box-shadow: 0 2px 5px #c7c7c7;
    }
  }

</style>


