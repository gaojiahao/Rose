<template>
	<div>
		<div id="td" class="page mescroll">
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
				<ul class='list'>
					<li @click="goDetail(tab)" v-for="(tab,index) in listArr" :key="index">
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
				</ul>
			</div>   
    	</div>
		
		<router-view></router-view>
		
	</div>
</template>

<script>
	import {getTask} from '../../service/service.js'
    export default{
    	data(){
    		return{
				show:false,
				listArr:[],
				list:[]
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
			var self = this;
			self.mescroll = new MeScroll("td",{
				up:{
					isBounce:false,
					use:false
															
				},
				down:{
					use:false
				}

			})
		},
		created(){
			var token = localStorage.getItem("token");
			getTask(token).then((res)=>{
				console.log(res);
				this.listArr = res.data.tableContent;
				this.$event.$emit("num",res.data.tableContent.length);
				
			})
			
		
		}	
			
			
	}
			
   
</script>

<style>
	
</style>

