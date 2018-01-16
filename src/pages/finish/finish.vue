<template>
	<div style="height:100%;">
		<div id="finish" class="page mescroll" >
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
				<ul class='list' id='finishTask' >
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
				<div class="bottom" v-if="show">
					<span>{{more}}</span>
				</div> 
			</div>   
    	</div>
    	
		<router-view></router-view>
		
	</div>
</template>

<script>
import { getLogin,getDoneTask } from '../../service/service.js'
    export default{
    	data(){
    		return{				
				doneList:[],
				mescroll:null,
				more:"",
				show:false
				
    		}
    	},
    	methods:{
    		
    		goDetail(tab){
				this.$router.push({path:"/finish/done_detail",query:{
					info:tab
				}})
			},
			upCallback() {
				this.show = true;
				this.more = "没有数据了"	;
			}
    	
		},
		created(){
			var token = localStorage.getItem("token");
				getDoneTask(token).then((res)=>{
					this.doneList = res.tableContent;
					
				})
			
		},
		mounted(){						
			var self = this;
			self.mescroll = new MeScroll("finish",{
				up:{
					isBounce:false,
					use:false,
					callback: self.upCallback()
				},
				down:{
					use:false
				},
				scrollbar:{
					use : "false", 
 					 barClass : "mescroll-bar" 
				}
			})
		}
					
	}	
    	
    
</script>

<style>
#finish .status{
	background-color:#09BB07 ;
}

</style>