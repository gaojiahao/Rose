<template>
<transition enter-active-class="slideInRight"
		leave-active-class="slideOutRight">
    <div id="td_detail">
		<!-- <div class='detail'>
			<p class="name">{{detailInfo.requireName}}</p>
			<p class="status1">{{detailInfo.status}}</p>
		</div> -->
		<group label-width="4.5em" label-margin-right="2em" label-align="left" v-if="detailInfo.requirement">
			<cell title="需求编码" :value="detailInfo.transCode" value-align="left" ></cell>
			<cell title="提交人" :value="detailInfo.baseinfo.creatorName" value-align="left" ></cell>
			<cell title="创建时间" :value="detailInfo.baseinfo.crtTime" value-align="left" ></cell>
			<cell title="需求名称" :value="detailInfo.requirement.requireName" value-align="left" v-if="detailInfo.requirement"></cell>
			<cell title="优先级" :value="detailInfo.requirement.level" value-align="left" v-if="!detailInfo.requirement.level.value"></cell>
			<cell title="优先级" :value="detailInfo.requirement.level" value-align="left" v-if="!detailInfo.requirement.level.value"></cell>
		</group>
		<ul>
			<li v-if="detailInfo.requireName">
				<span>需求名称:</span>
				<i>{{detailInfo.requireName}}</i>
			</li>
			<li>
				<span>发&nbsp;起&nbsp;人:</span>
				<i>{{detailInfo.crtName}}</i>
			</li>
			<li>
				<span>发起时间:</span>
				<i>{{detailInfo.crtTime}}</i>
			</li>
			<li v-if="detailInfo.level">
				<span>优&nbsp;先&nbsp;级:</span>
				<i>{{detailInfo.level}}</i>
			</li>
			<li>
				<span>预计交付日：</span>
				<input type="date"/>
			</li>
		</ul>
		<div class='process limit mescroll' id='dProcess'>
			<div class='wrapper'>
				<div class='agree_status'>
					<div v-for="tab in infoList" class='allInfo'>
						<div class='info' >
							<i class='iconfont icon-shenfenzheng'></i>
							<p>
								<span>{{tab.userName}}</span>
								<span>{{tab.nodeName}}</span>
								<span>{{tab.endTime}}</span>
							</p>
							<i class=" weui-icon weui-icon-success" v-if="tab.status"></i>
							<i class=" weui-icon weui-icon-waiting" v-if="!tab.status" style="top:15px;"></i>
							<em class='taskStatus'>{{tab.status}}</em>
							
						</div>
						<div class='iconfont icon-xia arrow' ></div>
					</div>
				</div>
			</div>					
		</div>
		<div class="btn">
			<span @click="agree()">同意</span>
			<span @click="reject()">拒绝</span>
		</div>			      
		<div class="js_dialog" id="iosDialog1" style="opacity: 1;" v-if="showDialog">
            <div class="weui-mask"></div>
            <div class="weui-dialog">
                <div class="weui-dialog__bd">{{dialogInfo}}</div>
                <div class="weui-dialog__ft">
                    <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_default" @click="close()">确认</a>
                    <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" @click="close()">取消</a>
                </div>
            </div>
        </div>
	</div>
</transition>
</template>

<script>
import { getListTask,getDetailInfo} from '../../service/service.js'
import { Group, Cell} from 'vux'
export default{
	data(){
		return{
			infoList:[],
			detailInfo:{},
			showDialog:false,
			dialogInfo:"确定同意该请求吗？"
		}
	},
	components: {
		Group,
		Cell
	},
	methods:{
		agree(){
			this.showDialog = true;
			this.dialogInfo = "确定同意该请求吗？";
		},
		reject(){
			this.dialogInfo = "确定拒绝该请求吗?";
			this.showDialog = true;
		},
		close(){
			this.showDialog = false;
		}

	},
	created(){
		this.detailInfo = this.$route.query.info;
		let token  = localStorage.getItem("token");
		let code = this.$route.query.info.businessKey;
		let time = new Date().getTime();
		console.log(token);
		getListTask(this.detailInfo.businessKey,token).then((result)=>{
			this.infoList = result;
			
		})
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
		self.mescroll = new MeScroll("dProcess",{
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
.vux-no-group-title,.vux-no-group-title{
	margin-top:0 !important;
}
#td_detail .taskDetail{
	width:100%;
	overflow: hidden;
	position:absolute;
	left:0;
	top:0;
	bottom:0;

}
#td_detail ul{
	border-bottom: 1px solid #ccc;
	padding: 15px;
}
#td_detail ul li{
	line-height: 30px;
	display: flex;
	
}
ul li span{
	color:lightslategrey;
	
}
ul li i{
	color:#000;
	flex:1;
	margin-left:5px;
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
	display: inline-block;
	margin-left:30px;
}
.info p span{
	display: block;
	margin-bottom:5px;
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
	top:35px;
}
.arrow{
	text-align: center;
}
</style>