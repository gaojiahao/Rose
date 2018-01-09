<template>
	<div>
		<div id="td" class="page">
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
					<li @click="goDetail(tab)" v-for="tab in listArr">
						<span class='task_name'>{{tab.requireName}}</span>
						<p>
							<span class='do_user'>发起人：{{tab.crtName}}</span>
						</p>        		
						<p>
							<em class='status'>{{tab.status}}</em>
							<em class='code'>{{tab.businessKey}}</em>
						</p>       		
						<i class="date">{{tab.startTime}}</i>
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
	import { getLogin,getTask } from '../../service/service.js'
	let iscroll;
    export default{
    	data(){
    		return{
				isLoadMore:false,
				token:"",
				listArr:[],
				more:"加载中"
    		}
    	},
    	methods:{
    		goDetail(tab){
				this.$router.push("/to_do/detail");
				this.$event.$emit("info",tab);
				
    		}
    	},
		mounted(){ 		
			iscroll = new IScroll('#td', {
				probeType: 3
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
			getLogin().then((result)=>{
				console.log(result);
				this.token = result.token;
				console.log(this.token);
			}),
			getTask().then((res)=>{
				console.log(res);
				this.listArr = res.tableContent;
				console.log(this.listArr);
				
			})
		}
			
    }
</script>

<style>
	#td{
		overflow: hidden;
	}
	.weui-search-bar:before{
		border-top:none;
	}
.list{	
	width:100%;
}
.list li{
	border-bottom:1px solid #e5e5e5;
	padding:10px  15px;
	overflow: hidden;
	position: relative;
	color:lightslategrey
}
li .task_name{
	display:block;
	width:200px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	font-size:16px;
	color: #666666;	
	margin-bottom: 3px;
}
.do_user{
	display: inline-block;
	font-size:12px;
	margin-bottom: 3px;
}
.status{
	padding: 1px 2px;
	display: inline-block;
	text-align: center;
	background-color:#10AEFF;
	color:#fff
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
	position: absolute;
	right:15px;
	top:13px;
	width:100px;
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

