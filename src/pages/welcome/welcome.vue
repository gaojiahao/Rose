<template>
  <router-view></router-view>
</template>

<script>
import { getLogin,getTask} from '../../service/service.js'
export default{
	data(){
		return{				
		}
	},
	created(){
		var token = localStorage.getItem("token");
		var that = this;
		setTimeout(function(){
			getTask(token).then((res)=>{
				if(res.status == 200){
					console.log(res.data);
					that.$router.replace("/to_do");	
				}
				else{
					console.log("进入了")
					var url = location.href;	
					//var url = "https://rfd.roletask.com/Rose/?code=fb3mQMS4Lvz8gKkSMedTMQJ4tpmzjRqF8ZHhFkRxSZA&state=1#/welcome";
					// 判断是否是从推送消息进来	
					if(url.indexOf('code')>0){				
						var arr = url.split("?");
						var arr1 = arr[1].split("&")
						var code = arr1[0].split("=")[1];
						getLogin(code).then((result)=>{
							localStorage.setItem("token",result.token);	
							that.$router.replace("/to_do");				
						})	
					}
					else{
						// 用户主动点击进入页面
						var rr = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=ww3c1aa17c16e380b7&redirect_uri=https%3a%2f%2frfd.roletask.com%2fRose%2f%23%2fto_do&response_type=code&scope=snsapi_base&agentid=1000017&state=1#wechat_redirect'
						window.location.href = rr;
					}	
					
					
				}
			})		

		},0)
		
	}	
		
		
}
			
     
</script>

<style>

</style>

