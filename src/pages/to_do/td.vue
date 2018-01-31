<template>
	<div>
		<div id="td" class="page">
			<search
			@result-click="resultClick"
			@on-change="getResult"
			v-model="value"
			position="absolute"
			auto-scroll-to-top
			@on-focus="onFocus"
			@on-cancel="onCancel"
			@on-submit="onSubmit"
			ref="search"></search>
			<div id='dmescroll' class="mescroll" style="padding-bottom:50px;">
				<ul class='list'>
					<li @click="goDetail(tab.businessKey)" v-for="(tab,index) in listArr" :key="index">
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
	import { Search } from 'vux'
    export default{
    	data(){
    		return{
				show:false,
				listArr:[],
				value:""
    		}
		},
		components: {
			Search
		},
    	methods:{
    		goDetail(param){
					this.$router.push({path:"/Rose/to_do/do_detail",query:{
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
					self.listArr = self.listArr.concat(curPageData);
					self.mescroll.endSuccess(curPageData.length);
					console.log(self.listArr);
				
				}, function() {
					//联网失败的回调,隐藏下拉刷新和上拉加载的状态;
					self.mescroll.endErr();
				});
				function getListDataFromNet(pageNum,successCallback,errorCallback){
					setTimeout(function () {
						var token = localStorage.getItem("token");
						getTask(token,pageNum).then((res)=>{
							successCallback&&successCallback(res.data.tableContent);//成功回调
						})
						
						
					},500)
				}
				
				
			},
	  	},
		mounted(){ 	
			var self = this;
			self.mescroll = new MeScroll("dmescroll",{
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
		},
		created(){
			var token = localStorage.getItem("token");
			var page = 1;
			getTask(token,page).then((res)=>{
				console.log(res);
				this.listArr = res.data.tableContent;
				this.$event.$emit("num",res.data.dataCount);
				
			})
			
		
		}	
			
			
	}
			
   
</script>

<style>
	
</style>

