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
						//var url = location.href;	
						var url = "https://rfd.roletask.com/Rose/?code=ggiBwzBQ2c6PsRr1sgliKBg-wopJaHwtHmEOA5o_02U&state=1";
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
			
			var url = location.href;
			var url = "https://rfd.roletask.com/Rose?code=UUyGn0LD8gcbH_iZz2WwY-CDkaoE9U4QBE-_Ew5R_iQ&state=1";
			// 判断是否是从推送消息进来			
			if(url.indexOf('code')>0){				
				var arr = url.split("?");
				var arr1 = arr[1].split("&")
				var code = arr1[0].split("=")[1];
				getLogin(code).then((result)=>{
					localStorage.setItem("token",result.token);	
					this.$router.push("/to_do");				
				})				
				
			}
			else{
				// 用户主动点击进入页面
				var rr = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=ww3c1aa17c16e380b7&redirect_uri=https%3a%2f%2frfd.roletask.com%2fRose%2f%23%2fto_do&response_type=code&scope=snsapi_base&agentid=1000017&state=1#wechat_redirect'
				window.location.href = rr;
			}
			
			
		}
			
    }
</script>

<style>
#td{
	overflow: hidden;
}
.weui-search-bar:before{
	border-top:none;
}
.list{	
	width:100%;
	z-index: 100;
}
.list li{
	border-bottom:1px solid #e5e5e5;
	padding:10px 15px;
	overflow: hidden;
	color:lightslategrey
}
li p{
	width:100%;
	height: 22px;
	line-height: 22px;
	margin-bottom:4px;
} 
p .task_name{
	display:block;
	width:200px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	font-size:16px;
	color: #666666;	
	margin-bottom: 3px;
	font-weight: 700;
	float:left;
}

p .do_user{
	font-size:14px;
	float:left;
}
p .status{
	/* position: absolute;
	right:40px;
	top:50px; */
	line-height: 22px;
	padding: 0 2px;
	display: inline-block;
	text-align: center;
	background-color:#10AEFF;
	color:#fff;
	float:right;
}
.status.near{
	background-color:#FFBE00 ;
	
}
.status.over{
	background-color:#F76260;
	
}
.code{
	display: inline-block;
}
.date{
	float: right;
	text-align: center;
	color:#666;
}
.bottom{
	width:100%;
	height:30px;
	line-height: 30px;
	text-align: center;
}
</style>

