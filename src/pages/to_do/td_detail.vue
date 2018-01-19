<template>
<transition enter-active-class="slideInRight"
		leave-active-class="slideOutRight">
    <div id="td_detail">
		<div class='mescroll' id="mescroll">
			<div class='wrapper'>
				<div class="head">待办表单信息</div>
				<group label-width="4.5em" label-margin-right="2em" label-align="left" v-if="detailInfo.transCode">
					<cell title="需求编码" :value="detailInfo.transCode" value-align="left" ></cell>
					<cell title="提交人" :value="detailInfo.baseinfo.creatorName" value-align="left" ></cell>
					<cell title="创建时间" :value="detailInfo.baseinfo.crtTime" value-align="left" ></cell>
					<cell title="需求名称" :value="detailInfo.requirement.requireName" value-align="left" v-if="detailInfo.baseinfo.requireName"></cell>
					<cell title="优先级" :value="detailInfo.requirement.level.value" value-align="left" v-if="detailInfo.requirement.level.value"></cell>
					<cell title="优先级" :value="detailInfo.requirement.level" value-align="left" v-if="!detailInfo.requirement.level.value"></cell>
					<datetime  format="YYYY-MM-DD HH:mm" @on-change="change" title="预计交付时间" placeholder="请选择" value-align="left"></datetime>				
					<cell title="用户故事" :value="detailInfo.requirement.userStory" value-align="left" ></cell>
					<cell 
						title="工作流"
						is-link
						:border-intent="false"
						:arrow-direction="show ? 'up' : 'down'"
						@click.native="show = !show"></cell>
				</group>
				<div class='process limit ' v-if="show">			
					<div class='agree_status'>
						<div v-for="tab in infoList" class='allInfo'>
							<div class='info' >
								<i class='iconfont icon-shenfenzheng'></i>
								<p>
									<span>{{tab.userName}}</span>
									<span>{{tab.nodeName}}</span>
									
								</p>
								<p><span>{{tab.endTime}}</span></p>
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
			<span @click="confirm()">同意</span>
			<span @click="reject()">拒绝</span>
		</div>			      
		<div v-transfer-dom>
			<confirm v-model="showDialog"
			@on-cancel="onCancel"
			@on-confirm="onConfirm"
			confirm-text="提交">
				<x-input title="实际工时:" type="number"></x-input>
				<x-textarea title="任务备注:"></x-textarea>	
			</confirm>
		</div>


	</div>
</transition>
</template>
</template>

<script>
import { getListTask,getDetailInfo} from '../../service/service.js'
import { Group, Cell,Datetime,XInput,XTextarea,Confirm,TransferDomDirective as TransferDom } from 'vux'
export default{
	data(){
		return{
			infoList:[],
			detailInfo:{},
			showDialog:false,
			show:false
		}
	},
	directives: {
		TransferDom
	},
	components: {
		Group,
		Cell,
		Datetime,
		XInput,
		XTextarea,
		Confirm
	},
	methods:{
		confirm(){
			this.showDialog = true;
			
		},
		reject(){			
			
		},
		onCancel () {
			
		},
		onConfirm (msg) {
			
		},		
		change(value){
			console.log(value);
		}
	},
	created(){
		this.detailInfo = this.$route.query.info;
		let token  = localStorage.getItem("token");
		let code = this.$route.query.info.businessKey;
		console.log(token);
		getListTask(this.detailInfo.businessKey,token).then((result)=>{
			this.infoList = result;
			
		})
		let time = new Date().getTime();
		getDetailInfo(time,token,code).then((result)=>{
			if(result.length>=1){
				this.detailInfo = JSON.parse(result[0].json_data);
			}
			var t = JSON.parse(result[0].json_data);
			console.log(t);
		})
	},
	mounted(){	
		var self = this;
		self.mescroll = new MeScroll("mescroll",{
			up:{
				isBounce:false,
				use:false
			},
			down:{
				use:false
			}
		})	

		
			
	}
	
}
    
</script>

<style>
#td_detail{
	width:100%;
	position:absolute;
	left:0;
	top:0;
	bottom: 0;
	z-index:100;	
	background: #fff;
}
#mescroll{
	width:100%;
	position:absolute;
	left:0;
	top:0;
	bottom:0;
}
#mescroll .head{
	line-height: 40px;
	text-align: center;
	font-size:16px;
}
.vux-no-group-title,.vux-no-group-title{
	margin-top:0 !important;
}
.vux-cell-primary {
text-align: left !important;
}
.weui-dialog__bd:first-child {
	padding:10px !important; 
}
.btn{
	position: absolute;
	left: 0;
	bottom:0;
	width:100%;
	text-align: center;
	display: flex;
	height:40px;
	line-height: 40px;
	color:#fff;
	font-size:16px;
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
	
}
.process.limit{
	height: 370px;
	border-bottom: 1px solid #ccc;
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
	margin-bottom:50px;
}
.info .iconfont{
	position: absolute;
	top:20px;
}
.allInfo:last-child .arrow{
	display: none;
}
.info p{
	display:block;
	margin-left:35px;
}
info p span{
	display:inline-block;
	margin-bottom:5px;
}
.info p span.name{
	margin-right:15px;
}
.taskStatus{
	position: absolute;
	right:26px;
	top:13px;
}
.process_over{
	border: 1px solid #ccc;
    padding: 10px;
	text-align: center;
	color:#E64340;
}
.weui-icon{
	position:absolute;
	right:25px;
	top:25px;
}
.arrow{
	text-align: center;
}
.weui-dialog__bd:first-child {
    padding:5px 10px;
    
}
</style>