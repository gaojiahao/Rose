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
				<ul class='list' id='finishTask' v-if="doneList.length>1">	
					<li @click="goDetail(tab)" v-for="(tab,index) in doneList" :key="index">
						<p>
							<span class='task_name' v-if="tab.requireName">{{tab.requireName}}</span>
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
				list:[]
    		}
    	},
    	methods:{
    		goDetail(tab){
				this.$router.push({path:"/finish/done_detail",query:{
					info:tab
				}})
			},
			upCallback(page) {
				var self = this;
				this.getListDataFromNet(page.num, page.size, function(curPageData) {
					console.log(page.num,page.size);
					if(page.num == 1) self.doneList = [];
					console.log(curPageData);
					self.doneList = self.doneList.concat(curPageData);
					self.mescroll.endSuccess(curPageData.length);
					console.log(self.doneList);
				
				}, function() {
					//联网失败的回调,隐藏下拉刷新和上拉加载的状态;
					self.mescroll.endErr();
				});
				// function getListDataFromNet(pageNum,pageSize,successCallback,errorCallback){
				// 	setTimeout(function () {
				// 		var data=self.list;
				// 		var listData=[];//模拟分页数据
				// 		for (var i = (pageNum-1)*pageSize; i < pageNum*pageSize; i++) {
				// 			if(i==data.length) break;
				// 			listData.push(data[i]);
				// 		}
				// 		console.log(listData);
						
				// 			successCallback&&successCallback(listData);//成功回调
						
						
						
				// 	},500)
				// }
				
				
			},
			downCallback(){
				var self = this;
				this.getListDataFromNet(1, 10, function(data){
					//联网成功的回调,隐藏下拉刷新的状态
					self.mescroll.endSuccess();
					//设置列表数据
					self.doneList = data;
				}, function(){
					//联网失败的回调,隐藏下拉刷新的状态
	                self.mescroll.endErr();
				});
				// function getListDataFromNet(pageNum,pageSize,successCallback,errorCallback){
				// 	setTimeout(function () {
				// 		var data=self.list;
				// 		var listData=[];//模拟分页数据
				// 		for (var i = (pageNum-1)*pageSize; i < pageNum*pageSize; i++) {
				// 			if(i==data.length) break;
				// 			listData.push(data[i]);
				// 		}
				// 		console.log(listData);
						
				// 			successCallback&&successCallback(listData);//成功回调
						
						
						
				// 	},500)
				// }
			},
			getListDataFromNet(pageNum,pageSize,successCallback,errorCallback){
				var self = this;
				setTimeout(function () {
					
					var data=self.list;
					
					var listData=[];//模拟分页数据
					for (var i = (pageNum-1)*pageSize; i < pageNum*pageSize; i++) {
						if(i==data.length) break;
						listData.push(data[i]);
					}
					console.log(listData);
					
						successCallback&&successCallback(listData);//成功回调
					
					
					
				},500)
			}
			
    	
		},
		created(){
			var token = localStorage.getItem("token");
				getDoneTask(token).then((res)=>{
					this.list = res.tableContent;
					//this.doneList =  res.tableContent.slice(0,10)
				})
			
		},
		mounted(){						
			var self = this;
			self.mescroll = new MeScroll("finish",{
				up:{
					isBounce:false,
					page:{
						num:0,
						size:10
					},
					callback: self.upCallback
				},
				down:{
					callback:self.downCallback
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