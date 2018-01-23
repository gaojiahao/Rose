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
					//var url = "https://rfd.roletask.com/Rose/?code=vgHSwrbhwT6noFC54U-2HFh8VnQrxUbwRoIWVPvE0-I&state=1";
					// 判断是否是从推送消息进来					
					var arr = url.split("?");
					var arr1 = arr[1].split("&")
					var code = arr1[0].split("=")[1];
					getLogin(code).then((result)=>{
						localStorage.setItem("token",result.token);	
						that.$router.replace("/to_do");				
					})	
					
				}
			})		

		},0)
		
	}	
		
		
}
			
     
</script>

<style>

</style>

