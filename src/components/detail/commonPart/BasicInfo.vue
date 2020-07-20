<template>
  <!-- 经办信息 （订单、主体等） -->
  <div class="basic-container-warp">
    <div class="basic-container-warp-trans">
      <div>{{orderInfo.transCode}} 
        <span class="biStatus" v-instanceStateDirective="{status:orderInfo.biStatus}" >{{status}}
        </span>
      </div>
      <div class="basic-container-warp-process">
        <div class="basic-container-warp-process-label">流程状态</div>
         <r-picker class="basic-container-warp-process-value" title="" 
          :data="statusList" 
          :value="nowStatus" 
          v-model="nowStatus" 
          @input="updateProcessStatus">
          </r-picker>
      </div>
    </div>
    <div class="basic-container-warp-handle">
      <div class="basic-container-warp-handle-item vux-1px-b">
         <div class="basic-container-warp-handle-item-label">经办主体</div>
         <div class="basic-container-warp-handle-item-value">{{orderInfo.handlerEntityName}}</div>
      </div>
      <div class="basic-container-warp-handle-item vux-1px-b">
         <div class="basic-container-warp-handle-item-label">经办人</div>
         <div class="basic-container-warp-handle-item-value">{{orderInfo.handlerName}}</div>
      </div>
       <div class="basic-container-warp-handle-item vux-1px-b">
         <div class="basic-container-warp-handle-item-label">经办组织</div>
         <div class="basic-container-warp-handle-item-value">{{orderInfo.handlerUnitName}}</div>
      </div>
       <div class="basic-container-warp-handle-item vux-1px-b">
         <div class="basic-container-warp-handle-item-label">创建者</div>
         <div class="basic-container-warp-handle-item-value">{{orderInfo.creatorName}}</div>
      </div>
       <div class="basic-container-warp-handle-item vux-1px-b">
         <div class="basic-container-warp-handle-item-label">经办职位</div>
         <div class="basic-container-warp-handle-item-value">{{orderInfo.handlerRoleName}}</div>
      </div>
       <div class="basic-container-warp-handle-item vux-1px-b">
         <div class="basic-container-warp-handle-item-label">修改者</div>
         <div class="basic-container-warp-handle-item-value">{{orderInfo.modiferName}}</div>
      </div>
       <div class="basic-container-warp-handle-item ">
         <div class="basic-container-warp-handle-item-label">修改时间</div>
         <div class="basic-container-warp-handle-item-value">{{orderInfo.modTime | dateFormat }}</div>
      </div>
    </div>
    <!-- <div class="basic-info-main">
      <div class="basic_trans">{{orderInfo.transCode}} 
      <span class="biStatus" 
        v-instanceStateDirective="{status:orderInfo.biStatus}" >{{status}}
        </span>
      </div>

      <header class="basic_header">
        <div class="basic_header_label">流程状态</div>
        <div class="basic_process_status">
          <r-picker title="" 
          :data="statusList" 
          :value="nowStatus" 
          v-model="nowStatus" 
          @input="updateProcessStatus">
          </r-picker>
        </div>
      </header>
      <div class="basic_detail">
        <div class="basic_detail_wrapper vux-1px-b">
          <div class="basic_detail_item">
            <span class="basic_detail_title">经办主体</span>
            <span class="basic_detail_value">{{orderInfo.handlerEntityName}}</span>
          </div>
        </div>
        <div class="basic_detail_wrapper vux-1px-b">
          <div class="basic_detail_item">
            <span class="basic_detail_title">经办人</span>
            <span class="basic_detail_value">{{orderInfo.handlerName}}</span>
          </div>
        </div>
        <div class="basic_detail_wrapper vux-1px-b">
          <div class="basic_detail_item">
            <span class="basic_detail_title">经办组织</span>
            <span class="basic_detail_value">{{orderInfo.handlerUnitName}}</span>
          </div>
        </div>
        <div class="basic_detail_wrapper vux-1px-b">
          <div class="basic_detail_item">
            <span class="basic_detail_title">创建者</span>
            <span class="basic_detail_value">{{orderInfo.creatorName}}</span>
          </div>
        </div>
         <div class="basic_detail_wrapper vux-1px-b">
          <div class="basic_detail_item">
            <span class="basic_detail_title">经办职位</span>
            <span class="basic_detail_value">{{orderInfo.handlerRoleName}}</span>
          </div>
        </div>
        <div class="basic_detail_wrapper vux-1px-b">
          <div class="basic_detail_item">
            <span class="basic_detail_title">修改者</span>
            <span class="basic_detail_value">{{orderInfo.modiferName}}</span>
          </div>
        </div>
        <div class="basic_detail_wrapper">
          <div class="basic_detail_item">
            <span class="basic_detail_title">修改时间</span>
            <span class="basic_detail_value">{{orderInfo.modTime | dateFormat }}</span>
          </div>
        </div>
      </div>
    </div> -->
    <div class="project-container vux-1px-t" v-if="projectInfo.projectName">
      <div class="project_title">项目信息</div>
      <div class="project_item">
        <i class="icon icon-project"></i>
        <span class="project_item_title">项目名称: </span>
        <span class="project_item_value">{{projectInfo.projectName}}</span>
      </div>
      <div class="project_item">
        <i class="icon icon-type"></i>
        <span class="project_item_title">项目类型: </span>
        <span class="project_item_value">{{projectInfo.projectType}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import { dateFormat } from 'vux'
  import { fail } from 'assert';
  import RPicker from 'components/public/basicPicker'
  import { isMyflow,getProcessStatusByListId,getStatusProcessByTransCode,updateProcessStatus} from "service/detailService";

  export default {
    name: "BasicInfo",
    props: {
      workFlowInfo: {
        type: Object,
        default() {
          return {}
        }
      },
      orderInfo: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    components:{
      RPicker
    },
    watch:{
      orderInfo:{
        handler(val) {
          this.nowStatus = val.biProcessStatus;
          this.status = val.biStatus;
        }
      }
    },
    computed: {
      projectInfo() {
        let {outPut = {}, inPut = {}} = this.orderInfo;
        let project = outPut.project || inPut.project || '';
        let projectType = outPut.projectType_project || inPut.projectType_project || '';
        return {
          projectName: project,
          projectType,
        }
      }
    },
    filters: { dateFormat },
    data() {
      return {
        showMore: false,
        statusList:[],
        nowStatus:'',
        status:'',
      }
    },
    methods:{
      updateProcessStatus(val) {
        let data = {
            transCode : this.$route.query.transCode,
            processStatus: val
        };
        return updateProcessStatus(data).then(data => {
          this.$vux.toast.text(data.message, 'top')  
        });    
      },
      getProcessStatusByListId() {
        let data = {
            listId : this.$route.params.listId
        };
        return getProcessStatusByListId(data).then(({tableContent = []}) => {
          for(let item of tableContent) {
            this.statusList.push(item.fieldValue); 
          }
        });
      },
    },
    created(){
      this.nowStatus = this.orderInfo.biProcessStatus;
      this.status = this.orderInfo.biStatus;
      this.getProcessStatusByListId();
    }
  }
</script>

<style scoped lang="scss">

.basic-container-warp{

  .basic-container-warp-trans{
    padding: 0 .15rem;
    background: #FFF;
  }
  
  .basic-container-warp-process{

    display: flex;
    .basic-container-warp-process-label{
      flex: 1;
      color:#999;
      font-size: 14px;
      line-height: 34px;
    }
    .basic-container-warp-process-value{
      flex: 1;
    }
  }

  .basic-container-warp-handle{
    padding: 0 .15rem;
    background: #FFF;
    margin-top: .1rem;
    
    .basic-container-warp-handle-item{
      padding: .1rem 0;
      display: flex;
      justify-content: space-between;

      .basic-container-warp-handle-item-label{
        color:#999;
        font-size: 14px;
      }
      .basic-container-warp-handle-item-value{
        color: #333;
        font-size: 14px;
      }
    }

  }
}
  // 基本信息 （订单、经办主体等）
  .basic-container {
    width: 100%;
    color: #333;
    // margin: .1rem;
    border-radius: .04rem;
    background-color: #F8F8F8;
    // width: calc(100% - .2rem);
     .basic_trans{
        background-color: white;
        padding: 0 .15rem;
        width: 100%;
     }
    .basic-info-main {
      width: 100%;
      // padding: 0 .15rem .15rem;
      box-sizing: border-box;
      .basic_header {
        width: 100%;
        background-color: white;
        padding: 0px 0.15rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: .1rem;
        .basic_header_label{
          color: #999;
          font-size: 14px;
        }
      }
      .basic_title {
        font-size: 16px;
        font-weight: 600;
        line-height: .16rem;
        &:before {
          left: -.15rem;
          width: .08rem;
          border-left: .08rem solid #3296FA;
        }
      }
      .basic_process_status {
        color: #FB880B;
        font-size: .1rem;
        //border: 1px solid;
        line-height: .12rem;
        border-radius: .04rem;
        padding: .04rem .06rem;
      }

      .basic_top {
        display: flex;
        //padding: .05rem;
        font-size: .12rem;
        align-items: center;
        line-height: .14rem;
        background-color: #f7f7f7;
        justify-content: space-between;
        margin-top: .1rem;
      }
      .basic_code_title {
        color: #999;
      }
      .basic_detail {
        font-size: .14rem;
    line-height: .14rem;
    background-color: white;
    padding: 0 .15rem;
      }
      .basic_detail_wrapper {
        display: flex;
        // margin-top: .1rem;
        padding: .1rem 0;
        &.spec_part {
          margin-top: .2rem;
        }
      }
      .basic_detail_item {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-around;
        flex: 1;
        & + .basic_detail_item {
          margin-left: .2rem;
        }
      }
      .basic_detail_title {
        flex: 1;
        color: #999;
      }
      .basic_detail_value {
        -webkit-box-flex: 1;
        -ms-flex: 1;
        flex: 1;
        text-align: right;
      }
    }

    .project-container {
      padding: .22rem .15rem .15rem;
      &:before {
        border-color: #e8e8e8;
      }
      .project_title {
        font-size: .16rem;
        line-height: .16rem;
      }
      .project_item {
        display: flex;
        font-size: .14rem;
        margin-top: .14rem;
        align-items: center;
        line-height: .14rem;
        & + .project_item {
          margin-top: .1rem;
        }
      }
      .icon {
        width: .16rem;
        height: .16rem;
        display: inline-block;
        background-size: 100%;
      }
      .project_item_title {
        color: #999;
        margin-left: .08rem;
      }
      .project_item_value {
        margin-left: .05rem;
      }
    }
  }

.biStatus{
    color: white;
    padding: 0.02rem 0.04rem;
    border-radius: 0.10rem;
    font-size: 0.12rem;
  }
</style>
