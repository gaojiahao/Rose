<template>
	<div>
		<div id="finish" class="page" ref="content">
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
					<!-- <li class="no_task" v-if="doneList.length==0">
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
import { getLogin,getDoneTask } from '../../service/service.js'
import BScroll from 'better-scroll'
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
				this.$router.push({path:"/finish/done_detail",query:{
					info:tab
				}})
			},
			// initScroll(){
			// 	if(!this.scroll){
			// 		console.log("11")
			// 		this.iscroll = new BScroll(this.$refs.content,{
			// 			click:true,
			// 			probeType:2
			// 		})
			// 		this.iscroll.on("touchend",(pos)=>{
			// 			if(pos.y <= (this.scroll.maxScrollY + 50) ) {
			// 				this.isLoadMore = true;
			// 				this.more = "没有数据了"
			// 			}
			// 		})
			// 	}
			// 	else{
			// 		console.log("222")
			// 		this.scroll.refresh();
			// 	}
				
			// }
    	
		},
		created(){
			var token = localStorage.getItem("token");
			getDoneTask(token).then((res)=>{
				this.doneList = res.tableContent;
				// this.$nextTick(()=>{
				// 	this.initScroll();
				// })
			})
			
		},
		mounted(){						
			this.$nextTick(()=>{     
				var iscroll = new BScroll(this.$refs.content,{
					probeType:2,
					scrollY:true,
					click:true,
					bounce:false,
					deceleration:0.005,
					pullUpLoad:{
						threshold:-50
						}
				})				
			
				iscroll.on("pullingUp",()=>{
					this.isLoadMore = true;
					var that = this;
					this.$nextTick(function(){   
						iscroll.finishPullUp();                                    
						iscroll.refresh();  
					});
					setTimeout(() => {
						this.more = "没有数据了"
					}, 1000);
				})
			
			})
				
				
			
			

			// iscroll = new IScroll('#finish', {
			// 	probeType: 2,
			// 	click:true
			// });
			// iscroll.on('scrollStart', ()=>{
			
			// 	if(iscroll.maxScrollY < 0){
			// 		this.isLoadMore = true;
			// 	}
			// 	iscroll.refresh();
			// })
			// iscroll.on("scroll",()=>{
			// 	if(iscroll.y<=iscroll.maxScrollY-30){
			// 		this.more = "没有数据了"				
			// 	}
			// })
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

</style>