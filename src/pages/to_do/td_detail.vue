<template>
<transition enter-active-class="slideInRight"
		leave-active-class="slideOutRight">
    <div id="td_detail">
		<div class='detail'>
			<p class="name">{{detailInfo.requireName}}</p>
			<p class="status1">{{detailInfo.status}}</p>
		</div>
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
		<div class='process limit'>
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
import { getListTask} from '../../service/service.js'
import BScroll from 'better-scroll'
 let detailScroll;
export default{
	data(){
		return{
			infoList:[],
			detailInfo:{},
			showDialog:false,
			dialogInfo:"确定同意该请求吗？"
		}
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
		console.log(token);
		getListTask(this.detailInfo.businessKey,token).then((result)=>{
			this.infoList = result;
			
		})
	},
	mounted(){
			detailScroll = new BScroll(".process",{
				probeType:2,
				bounce:false,
				deceleration:0.005
				
			})
			// detailScroll = new IScroll('.process', {
			// 	probeType: 2,
			// 	click:true
			// });
			// detailScroll.on('scrollStart', ()=>{			
			// 	detailScroll.refresh();
			// })
			

		
			
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
#td_detail .taskDetail{
	width:100%;
	overflow: hidden;
	position:absolute;
	left:0;
	top:0;
	bottom:0;

}
.detail{
	width:100%;
	border-bottom: 1px solid #ccc;
	padding: 15px;
	font-size:20px;
	color:#000;
	font-weight: 700;
	text-align: center;
	position: relative;
}
.detail .name{
	display:inline-block;
	width:200px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.detail .status1{
	width:50px;
	line-height: 20px;
	padding: 2px 0;
	text-align: center;
	color:#fff ;
	background:#10AEFF ;
	position:absolute;
	right: 15px;
	top:18px;
	font-size:12px;
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
	overflow: hidden;
	/* margin-bottom:60px; */
	/* position: absolute;
	left: 0;
	top:300px; */
	
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