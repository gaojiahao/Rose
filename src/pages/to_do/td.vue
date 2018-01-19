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
			</div>   
    	</div>
		
		<router-view></router-view>
		
	</div>
</template>

<script>
	import { getLogin,getTask} from '../../service/service.js'
	import { Group, Cell } from 'vux'

    export default{
    	data(){
    		return{
				show:false,
				listArr:[],
				more:"",
				list:[]
    		}
		},
		components: {
			Group,
			Cell
		},
    	methods:{
    		goDetail(tab){
					this.$router.push({path:"/to_do/do_detail",query:{
						info:tab
					}})
			}
		// 	upCallback(page) {
		// 		var self = this;
		// 		getListDataFromNet(page.num, page.size, function(curPageData) {
		// 			if(page.num == 1) self.listArr = [];
		// 			self.listArr = self.listArr.concat(curPageData);
		// 			self.mescroll.endSuccess(curPageData.length);
		// 			console.log(self.listArr);
				
		// 		}, function() {
		// 			//联网失败的回调,隐藏下拉刷新和上拉加载的状态;
		// 			self.mescroll.endErr();
		// 		});
		// 		function getListDataFromNet(pageNum,pageSize,successCallback,errorCallback){
		// 			setTimeout(function () {
		// 				var data=self.list;
		// 				var listData=[];//模拟分页数据
		// 				for (var i = (pageNum-1)*pageSize; i < pageNum*pageSize; i++) {
		// 					if(i==data.length) break;
		// 					listData.push(data[i]);
		// 				}
		// 				successCallback&&successCallback(listData);//成功回调
						
		// 			},500)
		// 		}
				
				
		// 	}
    	},
		mounted(){ 	
			var self = this;
			self.mescroll = new MeScroll("td",{
				up:{
					// callback:self.upCallback,
					isBounce:false,
					use:false
					// page:{
					// 	num:0,
					// 	size:10
					// }											
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

