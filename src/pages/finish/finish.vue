<template>
	<div style="height:100%;">
		<div id="finish" class="page" >
			<search
			@result-click="resultClick"
			@on-change="getResult"
			position="absolute"
			v-model="value"
			@on-focus="onFocus"
			@on-cancel="onCancel"
			@on-submit="onSubmit"
			ref="search"></search>
			<div class='mescroll' id="fmescroll" style="padding-bottom:55px;">
				<ul class='list' id='finishTask' >
					<li @click="goDetail(tab.businessKey)" v-for="(tab,index) in doneList" :key="index">
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
			</div>	  
    	</div>
		<router-view></router-view>	
	</div>
</template>

<script>
import { getLogin,getDoneTask } from '../../service/service.js'
import { Search } from 'vux'
    export default{
    	data(){
    		return{				
				doneList:[],
				mescroll:null,
				show:true,
				list:[],
				value:""
				
    		}
    	},
		components: {
			Search
		},
    	methods:{
    		goDetail(param){
				this.$router.push({path:"/Rose/finish/done_detail",query:{
					data:param
				}})
			},
			setFocus () {
				this.$refs.search.setFocus()
			},
			resultClick (item) {
				window.alert('you click the result item: ' + JSON.stringify(item))
			},
			getResult (val) {
			// console.log('on-change', val)
			// this.results = val ? getResult(this.value) : []
			},
			onSubmit (value) {
				// this.$refs.search.setBlur()
				// this.$vux.toast.show({
				// 	type: 'text',
				// 	position: 'top',
				// 	text: 'on submit'
				// })
				console.log(value);
			},
			onFocus () {
				console.log('on focus')
			},
			onCancel () {
				console.log('on cancel')
			},
			upCallback(page) {
				var self = this;
				getListDataFromNet(page.num, function(curPageData) {
					self.doneList = self.doneList.concat(curPageData);
					self.mescroll.endSuccess(curPageData.length);
					console.log(self.doneList);
				
				}, function() {
					//联网失败的回调,隐藏下拉刷新和上拉加载的状态;
					self.mescroll.endErr();
				});
				function getListDataFromNet(pageNum,successCallback,errorCallback){
					setTimeout(function () {
						var token = localStorage.getItem("token");
						getDoneTask(token,pageNum).then((res)=>{
							successCallback&&successCallback(res.tableContent);//成功回调
						})
						
						
					},500)
				}
				
				
			}
			

    	
		},
		created(){
			var token = localStorage.getItem("token");
			var page =1;
			getDoneTask(token,page).then((res)=>{
				this.doneList = res.tableContent;
			})
			
		},
		mounted(){						
			var self = this;
			self.mescroll = new MeScroll("fmescroll",{
				up:{
					isBounce:false,
					page:{
						num:1,
						size:10
					},
					callback: self.upCallback
				},
				down:{
					use:false
				}
			})
		}
					
	}	
    	
    
</script>

<style>
#finish .status{
	background-color:#09BB07 ;
}
#finish .wrapper{
	margin-bottom: 15px;
}

</style>