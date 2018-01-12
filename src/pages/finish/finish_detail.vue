<template>
    <div id="finish_detail">
		<div class="taskDetail">
			<div class='wrapper'>
				<div class='detail'>
					<p class="name">{{detailInfo.requireName}}</p>
					<p class="status1 done_status">{{detailInfo.status}}</p>
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
				</ul>
				<div class='process'>
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
						<!-- <div class='iconfont icon-xia arrow' v-if="detailInfo.status=='已生效'"></div> -->
						<div class='process_over' v-if="detailInfo.status!='进行中'">流程结束</div>
						
					</div>
				</div>
			</div>
		</div>        
	</div>
</template>

<script>
import { getListTask} from '../../service/service.js'
 let detailScroll;
export default{
	data(){
		return{
			infoList:[],
			detailInfo:{}
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
		
			detailScroll = new IScroll('.taskDetail', {
				probeType: 2,
				click:true
			});
			detailScroll.on('scrollStart', ()=>{			
				detailScroll.refresh();
			})
			

		
			
	}
	
}
    
</script>

<style>
#finish_detail{
	width:100%;
	position:absolute;
	left:0;
	top:0;
	bottom: 0;
	z-index:100;	
	background: #fff;
}
#finish_detail .taskDetail{
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
.status1.done_status{
	background: #09bb07;
}
#finish_detail ul{
	border-bottom: 1px solid #ccc;
	padding: 15px;
}
#finish_detail ul li{
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
#finish_detail .process{
	width:100%;
	overflow: hidden;
	margin-bottom:30px;
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