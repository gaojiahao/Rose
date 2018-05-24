<template>
<div id="welcome">
	<p class="icon-loading">
		<spinner type="spiral"></spinner>
	</p>
	
  <router-view></router-view>
</div>
	
</template>

<script>
import { getLogin,getTask} from '../../service/service.js'
import { Spinner } from 'vux'
export default{
	data(){
		return{				
		}
	},
	components: {
		Spinner
	},
	created(){
		var token = localStorage.getItem("token");
		var that = this;
		setTimeout(function(){
			getTask(token,"1").then((res)=>{
				if(res.status == 200){
					console.log(res.data);
					that.$router.replace("/Rose/to_do");	
				}else{
					console.log("进入了")
					var url = location.href;	
					//var url = "https://rfd.roletask.com/welcome?code=vqZtrTcV3xvbwhs1e_KxFwFzQRvTuBnUNenL3Jj9oqw&state=1";
					// 判断是否是从推送消息进来	
					if(url.indexOf('welcome')>0&&url.indexOf("code")>0){				
						var arr = url.split("?");
						var arr1 = arr[1].split("&");
						var code = arr1[0].split("=")[1];
						getLogin(code).then((result)=>{
							localStorage.setItem("token",result.token);	
              				that.$router.replace("/Rose/to_do");				
              
						})	
					}
					else if(url.indexOf('detail')>0&&url.indexOf("code")>0){
						var arr = url.split("?");
						var arr1 = arr[1].split("&");
						console.log(arr1);
						var code = arr1[1].split("=")[1];
						var param = arr1[0].split("=")[1];
						getLogin(code).then((result)=>{
						localStorage.setItem("token",result.token);	
							that.$router.replace({path:"/Rose/detail",query:{
									data:param
							}})
										
						})
					
					}else{
						// 用户主动点击进入页面
						var rr = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=ww3c1aa17c16e380b7&redirect_uri=https%3A%2F%2Frfd.roletask.com%2FRose%2Fwelcome&response_type=code&scope=snsapi_base&agentid=1000017&state=1#wechat_redirect'
						window.location.href = rr;
					}  
        		}
      		})
    	},0)
		
 	 }
}
			
     
</script>

<style>
#welcome{
	height:100%;
	width:100%;
	position: absolute;
	z-index:50;
	background: #fff;
}
.icon-loading{
	width:35px;
	height:35px;
	position: absolute;
	top:50%;
	left:50%;
	margin-left:-17px;
	margin-top:-17px;

}
.vux-spinner{
	width:35px !important;
	height:35px !important;
}
.vux-spinner svg{
	width:35px !important;
	height:35px !important;
}
</style>

