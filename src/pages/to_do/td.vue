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
							<em class='code'>{{tab.businessKey}}</em>
							
						</p>       		
					</li>
					<!-- <li class="no_task" v-if="listArr.length==0">
						<em class='iconfont icon-wujilu' style="font-size:50px;"></em>
						<p>无任务</p>
					</li> -->
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
	import { getLogin,getTask} from '../../service/service.js'
	import BScroll from 'better-scroll'
	let iscroll;
    export default{
    	data(){
    		return{
				isLoadMore:false,
				listArr:[],
				more:"加载中...",
				arr:[]
    		}
		},
    	methods:{
    		goDetail(tab){
					this.$router.push({path:"/to_do/do_detail",query:{
						info:tab
					}})
    		}
    	},
		mounted(){ 	
			iscroll = new BScroll("#td",{
				probeType:2,
				click:true,
				scrollY:true,
				bounce:false,
				deceleration:0.005,
				pullUpLoad:{
					threshold:-50
				}
			})
			iscroll.on("scrollStart",()=>{
				iscroll.refresh();
			})
			iscroll.on("pullingUp",()=>{
				this.isLoadMore = true;
				var that = this;
				setTimeout(() => {
					this.more = "没有数据了"
				}, 1000);
			})
			// iscroll = new IScroll('#td', {
			// 	probeType: 2,
			// 	click:true
			// });
			// iscroll.on('scrollStart', ()=>{			
			// 	iscroll.refresh();
			// })
			// iscroll.on("scrollEnd",()=>{
			// 	let realY = iscroll.maxScrollY +40;
			// 	if(iscroll.y >iscroll.maxScrollY && iscroll.y <realY){
			// 		iscroll.scrollTo(0, iscroll.maxScrollY, 200);
			// 	}
			// 	if(iscroll.y<=iscroll.maxScrollY){
			// 		this.isLoadMore = true;
			// 		this.more = "没有数据了"	;		
			// 	}
			// })
		},
		created(){
			var token = localStorage.getItem("token");
			getTask(token).then((res)=>{
				console.log(res);
				this.listArr = res.data.tableContent;
				this.$event.$emit("num",res.data.tableContent.length);
				
			})
			window.scrollTo(0,0);
			
			
		}
			
    }
</script>

<style>
	#td{
		overflow: hidden;
	}
	
</style>

