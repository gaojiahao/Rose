<template>
	<div>
		<div id="finish" class="page">
			<div class='wrapper'>
				<div class="weui-search-bar" id="searchBar">
					<form class="weui-search-bar__form">
						<div class="weui-search-bar__box">
							<i class="weui-icon-search"></i>
							<input type="search" class="weui-search-bar__input" id="searchInput" placeholder="搜索" required="">
							<a href="javascript:" class="weui-icon-clear" id="searchClear"></a>
						</div>
						<label class="weui-search-bar__label" id="searchText">
							<i class="weui-icon-search"></i>
							<span>搜索</span>
						</label>
					</form>
					<a href="javascript:" class="weui-search-bar__cancel-btn" id="searchCancel">取消</a>
				</div>
				<ul class='list' >
					<li @click="goDetail(tab)" v-for="tab in doneList">
						<p>
							<span class='task_name'>{{tab.requireName}}</span>
							<i class="date">{{tab.startTime.substring(0,10)}}</i>
						</p>
						
						<p>
							<span class='do_user'>操作名称：{{tab.nodeName}}</span>
							<em class='status'>{{tab.status}}</em>
							
						</p>  
						<p>
							<span class='do_user'>发起人：{{tab.crtName}}</span>
						</p>      		
						<p>							
							<em class='code'>交易号：{{tab.businessKey}}</em>
						</p> 
						<p>							
							<em class='code'>完成时间：{{tab.endTime}}</em>
						</p>        		
						
						
					</li>
				</ul>
				<div class="bottom"  v-if="isLoadMore">
					<span>{{more}}</span>
				</div>
			</div>   
    	</div>
    	 <router-view></router-view>
	</div>
</template>

<script>
import { getLogin,getDoneTask } from '../../service/service.js'
let iscroll;
    export default{
    	data(){
    		return{
				isLoadMore:false,
				doneList:[],
				more:"加载中",
    		}
    	},
    	methods:{
    		
    		goDetail(tab){
				this.$router.push({path:"to_do/detail",query:{
					info:tab
				}})
    		}
    	
    	},
		mounted(){ 		
			iscroll = new IScroll('#finish', {
				probeType: 2,
				tap:true
			});
			iscroll.on('scrollStart', ()=>{
			
				if(iscroll.maxScrollY < 0){
					this.isLoadMore = true;
				}
				iscroll.refresh();
			})
			iscroll.on("scroll",()=>{
				if(iscroll.y<=iscroll.maxScrollY-30){
					this.more = "没有数据了"				
				}
			})
		},
		created(){
			var token = localStorage.getItem("token")
			getDoneTask(token).then((res)=>{
				this.doneList = res.tableContent;
				
			})
		}
    	
    }
</script>

<style>
#finish{
	overflow: hidden;
}
#finish .status{
	background-color:#09BB07 ;
}
.weui-search-bar:before{
	border-top:none;
}
.list{	
	width:100%;
}
.list li{
	border-bottom:1px solid #e5e5e5;
	padding:10px 15px;
	overflow: hidden;
	color:lightslategrey
}
li p{
	width:100%;
	height: 22px;
	line-height: 22px;
	margin-bottom:4px;
} 
p .task_name{
	display:block;
	width:200px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	font-size:16px;
	color: #666666;	
	margin-bottom: 3px;
	font-weight: 700;
	float:left;
}

p .do_user{
	font-size:14px;
	float:left;
}
p .status{
	/* position: absolute;
	right:40px;
	top:50px; */
	line-height: 22px;
	padding: 0 2px;
	display: inline-block;
	text-align: center;
	background-color:#10AEFF;
	color:#fff;
	float:right;
}
.status.near{
	background-color:#FFBE00 ;
	
}
.status.over{
	background-color:#F76260;
	
}
.code{
	display: inline-block;
}
.date{
	float: right;
	text-align: center;
	color:#666;
}
.bottom{
	width:100%;
	height:30px;
	line-height: 30px;
	text-align: center;
}	
</style>