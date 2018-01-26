<template>
<transition enter-active-class="slideInRight"
		leave-active-class="slideOutRight">
		
    <div id="td_detail" >
		<div id="mescroll" class='mescroll'>
			<div class='wrapper' v-if="detailInfo.baseinfo">
				<!-- CSBUG -->
				<group label-width="4.5em" label-margin-right="2em" label-align="left" v-if="(detailInfo.transCode).indexOf('CSBUG')>=0">
					<cell title="需求编码" :value="detailInfo.transCode" value-align="left" ></cell>
					<cell title="BUG标题" :value="detailInfo.requirement.requireName" value-align="left" v-if="detailInfo.requirement"></cell>
					<cell title="提交人" :value="detailInfo.baseinfo.creatorName" value-align="left" ></cell>
					<cell title="创建时间" :value="detailInfo.baseinfo.crtTime" value-align="left" ></cell>	
					<cell title="所属模块" :value="detailInfo.requirement.requireNature.value" value-align="left" ></cell>							
					<cell title="BUG类型" :value="detailInfo.requirement.requireDemension.value" value-align="left" ></cell>				
					<cell title="严重程度" :value="detailInfo.baseinfoExt.varchar4.value" value-align="left"></cell>
					<cell title="优先级" :value="detailInfo.requirement.level.value" value-align="left" v-if="detailInfo.requirement.level.value"></cell>
					<cell title="优先级" :value="detailInfo.requirement.level" value-align="left" v-if="!detailInfo.requirement.level.value"></cell>				
					<datetime  format="YYYY-MM-DD HH:mm" @on-change="change" title="预计交付时间" placeholder="请选择" value-align="left" v-if="!detailInfo.requirement.etc"></datetime>
					<cell 
						title="BUG重现步骤"
						is-link
						:border-intent="false"
						:arrow-direction="bugshow ? 'up' : 'down'"
						@click.native="bugshow = !bugshow"></cell>
					<cell-box v-if="bugshow">{{detailInfo.baseinfoExt.varchar5}}</cell-box>				
					<!-- <cell 
						title="用户故事"
						is-link
						:border-intent="false"
						:arrow-direction="storyshow ? 'up' : 'down'"
						@click.native="storyshow = !storyshow"></cell>
					<cell-box v-if="storyshow">{{detailInfo.requirement.userStory}}</cell-box>
					<cell 
						title="需求评审意见"
						is-link
						:border-intent="false"
						:arrow-direction="choiceShow ? 'up' : 'down'"
						@click.native="choiceShow = !choiceShow"></cell>
					<cell-box v-if="choiceShow">{{detailInfo.requirement.approvalOpinion}}</cell-box>
					<cell 
						title="验收标准"
						is-link
						:border-intent="false"
						:arrow-direction="show1 ? 'up' : 'down'"
						@click.native="show1 = !show1"></cell>
					<cell-box v-if="show1">{{detailInfo.requirement.acceptStandard}}</cell-box> -->
					<cell 
						title="工作流"
						is-link
						:border-intent="false"
						:arrow-direction="show ? 'up' : 'down'"
						@click.native="show = !show"></cell>

				</group>
				<!-- CPXQ -->
				<group label-width="4.5em" label-margin-right="2em" label-align="left" v-if="(detailInfo.transCode).indexOf('CPXQ')>=0">
					<cell title="需求编码" :value="detailInfo.transCode" value-align="left" ></cell>
					<cell title="需求名称" :value="detailInfo.requirement.requireName" value-align="left"></cell>
					<cell title="提交人" :value="detailInfo.baseinfo.creatorName" value-align="left" ></cell>
					<cell title="创建时间" :value="detailInfo.baseinfo.crtTime" value-align="left" ></cell>	
					<cell title="需求维度" :value="detailInfo.requirement.requireDemension.value" value-align="left" ></cell>							
					<cell title="优先级" :value="detailInfo.requirement.level.value" value-align="left" v-if="detailInfo.requirement.level.value"></cell>
					<cell title="优先级" :value="detailInfo.requirement.level" value-align="left" v-if="!detailInfo.requirement.level.value"></cell>				
					<datetime  format="YYYY-MM-DD HH:mm" @on-change="change" title="预计交付时间" placeholder="请选择" value-align="left" v-if="!detailInfo.requirement.etc"></datetime>			
					<cell 
						title="用户故事"
						is-link
						:border-intent="false"
						:arrow-direction="storyshow ? 'up' : 'down'"
						@click.native="storyshow = !storyshow"></cell>
					<cell-box v-if="storyshow">{{detailInfo.requirement.userStory}}</cell-box>
					<!-- <cell 
						title="需求评审意见"
						is-link
						:border-intent="false"
						:arrow-direction="choiceShow ? 'up' : 'down'"
						@click.native="choiceShow = !choiceShow"></cell>
					<cell-box v-if="choiceShow">{{detailInfo.requirement.approvalOpinion}}</cell-box> -->
					<cell 
						title="验收标准"
						is-link
						:border-intent="false"
						:arrow-direction="show1 ? 'up' : 'down'"
						@click.native="show1 = !show1"></cell>
					<cell-box v-if="show1">{{detailInfo.requirement.acceptStandard}}</cell-box>
					<cell 
						title="工作流"
						is-link
						:border-intent="false"
						:arrow-direction="show ? 'up' : 'down'"
						@click.native="show = !show"></cell>

				</group>
				<!-- SSXQ -->
				<group label-width="4.5em" label-margin-right="2em" label-align="left" v-if="(detailInfo.transCode).indexOf('SSXQ')>=0">
					<cell title="需求编码" :value="detailInfo.transCode" value-align="left" ></cell>	
					<cell title="项目名称" :value="detailInfo.requirementProject.projectName" value-align="left"></cell>
					<cell title="需求名称" :value="detailInfo.requirementProject.requireName" value-align="left"></cell>
					<cell title="提交人" :value="detailInfo.baseinfo.creatorName" value-align="left" ></cell>
					<cell title="创建时间" :value="detailInfo.baseinfo.crtTime" value-align="left" ></cell>
					<cell title="应用类型" :value="detailInfo.requirementProject.appType" value-align="left" v-if="!detailInfo.requirementProject.appType.value"></cell>
					<cell title="应用类型" :value="detailInfo.requirementProject.appType.value" value-align="left" v-if="detailInfo.requirementProject.appType.value"></cell>
					<cell title="应用名称" :value="detailInfo.requirementProject.appName" value-align="left" v-if="!detailInfo.requirementProject.appName.value"></cell>
					<cell title="应用名称" :value="detailInfo.requirementProject.appName.value" value-align="left" v-if="detailInfo.requirementProject.appName.value"></cell>
					<cell title="实现方式" :value="detailInfo.requirementProject.provideType" value-align="left" v-if="!detailInfo.requirementProject.provideType.value"></cell>
					<cell title="实现方式" :value="detailInfo.requirementProject.provideType.value" value-align="left" v-if="detailInfo.requirementProject.provideType.value"></cell>
					<cell title="优先级" :value="detailInfo.requirementProject.level.value" value-align="left" v-if="detailInfo.requirementProject.level.value"></cell>
					<cell title="优先级" :value="detailInfo.requirementProject.level" value-align="left" v-if="!detailInfo.requirementProject.level.value"></cell>
					<datetime  format="YYYY-MM-DD HH:mm" @on-change="change" title="预计交付时间" placeholder="请选择" value-align="left" v-if="!detailInfo.requirementProject.etc"></datetime>				
					<cell 
						title="用户故事"
						is-link
						:border-intent="false"
						:arrow-direction="storyshow ? 'up' : 'down'"
						@click.native="storyshow = !storyshow"></cell>
					<cell-box v-if="storyshow">{{detailInfo.requirementProject.userStory}}</cell-box>
					<cell 
						title="验收标准"
						is-link
						:border-intent="false"
						:arrow-direction="show1 ? 'up' : 'down'"
						@click.native="show1 = !show1"></cell>
					<cell-box v-if="show1">{{detailInfo.requirementProject.acceptStandard}}</cell-box>
					<!-- <cell 
						title="需求评审意见"
						is-link
						:border-intent="false"
						:arrow-direction="choiceShow ? 'up' : 'down'"
						@click.native="choiceShow = !choiceShow"></cell>
					<cell-box v-if="choiceShow">{{detailInfo.requirementProject.approvalOpinion}}</cell-box> -->
					<cell 
						title="工作流"
						is-link
						:border-intent="false"
						:arrow-direction="show ? 'up' : 'down'"
						@click.native="show = !show"></cell>

				</group>
				<!-- DMFBSQ -->
				<group label-width="4.5em" label-margin-right="2em" label-align="left" v-if="(detailInfo.transCode).indexOf('DMFBSQ')>=0">
					<cell title="需求编码" :value="detailInfo.transCode" value-align="left" ></cell>
					<cell title="需求名称" :value="detailInfo.baseinfo.transType2" value-align="left" ></cell>
					<cell title="提交人" :value="detailInfo.baseinfo.creatorName" value-align="left" ></cell>
					<cell title="创建时间" :value="detailInfo.baseinfo.crtTime" value-align="left" ></cell>
					<cell title="发布环境" :value="detailInfo.baseinfoExt.varchar2" value-align="left" ></cell>	
					<cell title="代码分支" :value="detailInfo.baseinfoExt.varchar4" value-align="left" ></cell>	
					<cell title="前后端" :value="detailInfo.baseinfoExt.varchar3.value" value-align="left" ></cell>	
					<cell title="预计发布时间" :value="detailInfo.baseinfoExt.datetime1" value-align="left" ></cell>
					<cell title="预计发布说明" :value="detailInfo.baseinfoExt.varchar1" value-align="left" ></cell>		
					<cell 
						title="工作流"
						is-link
						:border-intent="false"
						:arrow-direction="show ? 'up' : 'down'"
						@click.native="show = !show"></cell>

				</group>
				<!-- QJ -->
				<group label-width="4.5em" label-margin-right="2em" label-align="left" v-if="(detailInfo.transCode).indexOf('QJ')>=0">
					<cell title="需求编码" :value="detailInfo.transCode" value-align="left" ></cell>
					<cell title="需求名称" value="请假" value-align="left" ></cell>
					<cell title="提交人" :value="detailInfo.baseinfo.creatorName" value-align="left" ></cell>
					<cell title="创建时间" :value="detailInfo.baseinfo.crtTime" value-align="left" ></cell>
					<cell 
						title="请假详情"
						is-link
						:border-intent="false"
						:arrow-direction="show2 ? 'up' : 'down'"
						@click.native="show2 = !show2"></cell>
					<div class="qjDetail" v-if="show2">
						<div v-for="(item,index) in detailInfo.transDetail" :key="index" class='qgProcess'>
							<ul>
								<li>
									<span>请假原因:</span>
									<em>{{item.explain}}</em>
								</li>
								<li>
									<span>请假天数:</span>
									<em>{{item.num1}}</em>
								</li>
								<li>
									<span>请假类型:</span>
									<em>{{item.inventoryType.value}}</em>
								</li>
								<li>
									<span>开始时间:</span>
									<em>{{item.date1+item.starttime.value}}</em>
								</li>
								<li>
									<span>结束时间:</span>
									<em>{{item.date2+item.endtime.value}}</em>
								</li>
							</ul>	
							<div class='iconfont icon-xia arrow' ></div>
						</div>
						
					</div>
					<cell 
						title="工作流"
						is-link
						:border-intent="false"
						:arrow-direction="show ? 'up' : 'down'"
						@click.native="show = !show"></cell>

				</group>
				<div class='process limit' v-if="show">
					
						<div class='agree_status'>
							<div v-for="(tab,index) in infoList" class='allInfo' :key="index">
								<div class='info' >
									<i class='iconfont icon-shenfenzheng'></i>
									<p>
										<span>{{tab.userName}}</span>
										<span>{{tab.nodeName}}</span>
										
									</p>
									<p>
										<span>{{tab.endTime}}</span>
									</p>
									<p v-if="tab.message"><span>审批意见：{{tab.message}}</span></p>
									<i class=" weui-icon weui-icon-success" v-if="tab.status"></i>
									<i class=" weui-icon weui-icon-waiting" v-if="!tab.status" style="top:15px;"></i>

									
								</div>
								<div class='iconfont icon-xia arrow' ></div>
							</div>
						</div>
									
				</div>
			</div>
		</div>
		<div class="btn">
			<span @click="agree()">同意</span>
			<span @click="reject()">拒绝</span>
		</div>
		<div v-transfer-dom>
			<confirm v-model="confirmshow"
			@on-cancel="onCancel"
			@on-confirm="onConfirm">
				<group>
					<x-input title="实际工时:" type="number"></x-input>
					<x-textarea title="任务备注:"></x-textarea>	
				</group>
			</confirm>
		</div>				      
	</div>
	
</transition>
</template>

<script>
import { getListTask,getDetailInfo} from '../../service/service.js'
import { Group, Cell,Datetime,CellBox,Confirm,XInput ,XTextarea ,TransferDomDirective as TransferDom } from 'vux'
export default{
	data(){
		return{
			infoList:[],
			detailInfo:{},
			showDialog:false,
			show:false,
			show1:false,
			storyshow:true,
			choiceShow:false,
			bugshow:false,
			confirmshow:false,
			show2:false,
			list:[]
		}
	},
	 directives: {
		TransferDom
	},
	components: {
		Group,
		Cell,
		Datetime,
		CellBox,
		Confirm,
		XInput ,
		XTextarea 
		
		
	},
	methods:{
		agree(){
			this.confirmshow = true;
		},
		reject(){
			this.showDialog = true;
		},
		close(){
			this.showDialog = false;
		},
		change(value){
			console.log(value);
		},
		onCancel(){
			
		},
		onConfirm(){

		}


	},
	created(){
		//this.detailInfo = this.$route.query.data;
		let token  = localStorage.getItem("token");
		let code = this.$route.query.data;
		let time = new Date().getTime();
		console.log(token);
		getListTask(code,token).then((result)=>{
			this.infoList = result;
			
		})
		getDetailInfo(time,token,code).then((result)=>{
			if(result.length>=1){
				this.detailInfo = JSON.parse(result[0].json_data);
			}
			var t = JSON.parse(result[0].json_data);
		})
 

	},
	mounted(){	
		var self = this;
		self.mescroll = new MeScroll("mescroll",{
			up:{
				isBounce:false,
				use:false,
				auto:false

			},
			down:{
				use:false,
				auto:false,
				isLock:false
			}
		})	

		
			
	}
	
}
    
</script>

<style>
#td_detail{
	width:100%;
	height: 100%;
	position:absolute;
	left:0;
	top:0;
	z-index:100;	
	background: #fff;
	
}
#mescroll .wrapper{
	padding-bottom: 60px;
	background: #fff;
}
.vux-no-group-title,.vux-no-group-title{
	margin-top:0 !important;
}
.weui-cell:before{
	left:0 !important;
}
.vux-cell-primary {
text-align: left !important;
}
.vux-cell-box{
	color:#999;
}
.weui-dialog__bd:first-child {
	padding:0px !important; 
}

.btn{
	position: fixed;
	left: 0;
	bottom:0;
	width:100%;
	text-align: center;
	display: flex;
	height:46px;
	line-height: 46px;
	color:#fff;
	font-size:16px;
	z-index:10;
}
.btn span{
	flex:1;
}
.btn span:first-child{
	background-color: #09bb07;
}
.btn span:last-child{
	background-color: #E64340;
}
.process{
	width:100%;
	background: #FFF;
	
}
.process .agree_status{	
	margin:15px;
}
.agree_status .info{
	border:1px solid #ccc;
	padding: 15px 10px;
	position: relative;
	vertical-align: middle;
}
.allInfo:first-child{
	margin-top:10px;
}
.allInfo:last-child{
	margin-bottom:10px;
}
.info .iconfont{
	position: absolute;
	top:20px;
}
.allInfo:last-child .arrow{
	display: none;
}
.info p{
	display: block;
	margin-left:30px;
}
.info p span{
	display: inline-block;
	margin-bottom:5px;
	margin-right: 20px;
}
.process_over{
	border: 1px solid #ccc;
    padding: 10px;
	text-align: center;
	color:#E64340;
}
.weui-icon{
	position:absolute;
	right:15px;
	top:25px;
}
.arrow{
	text-align: center;
}
.qjDetail{
	padding: 15px;
}
.qjDetail:before {
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 1px;
    border-top: 1px solid #D9D9D9;
    /* color: #D9D9D9;
    transform-origin: 0 0; */
    transform: scaleY(0.5);
}
.qjDetail ul{
	border:1px solid #ccc;
	padding:10px;
}
.qjDetail ul:last-child{
	position: relative;
}
.qjDetail ul li{
	line-height: 25px;
}
.qjDetail ul li span{
	margin-right: 10px;
}
.qgProcess:last-child .arrow{
	display: none;
}
</style>