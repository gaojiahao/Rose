<template>
<div>
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
	</ul>
</div>
</template>

<script>
	import { getLogin,getTask} from '../../service/service.js'
    export default{
    	data(){
    		return{				
				listArr:[],
				arr:[]
    		}
		},
    	methods:{
    		goDetail(tab){
					this.$router.push({path:"to_do/detail",query:{
						info:tab
					}})
    		}
    	},
		created(){
			var url = "https://rfd.roletask.com/Rose/?code=3hrrgxM6-91PRPrpbSoZDqwgR_KCXxImZ5dcRiMhlME&state=1#/to_do";
			// 判断是否是从推送消息进来
			if(url.indexOf('code')>0){
				var arr = url.split("?");
				var arr1 = arr[1].split("&")
				var code = arr1[0].split("=")[1];
				console.log(code);
				getLogin(code).then((result)=>{
					localStorage.setItem("token",result.token);
				})
			}
			// else{
			// 	// 用户主动点击进入页面
			// 	var rr = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=ww3c1aa17c16e380b7&redirect_uri=https%3A%2F%2Frfd.roletask.com%2FRose&response_type=code&scope=snsapi_base&agentid=1000017&state=1#wechat_redirect'
			// 	window.location.href = rr;
			// }
			
			
			var token = localStorage.getItem("token");
			console.log(token);
			if(token){
				getTask(token).then((res)=>{
					this.listArr = res.tableContent;
					this.$event.$emit("num",res.tableContent.length);
					
				})
			}
			
		}
			
    }
</script>

<style>
</style>

