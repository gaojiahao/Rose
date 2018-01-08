<template>
    <div id="td_detail">
        <div class='detail'>
			<button @click="$router.back()">返回</button>
        	售后申请列表 
        	<p class="status1">进行中</p>
        </div>
        <ul>
        	<li>
        		<span>需求名称:</span>
        		<i>增加应用-综合报表</i>
        	</li>
        	<li>
        		<span>提&nbsp;交&nbsp;人:</span>
        		<i>欧阳锋</i>
        	</li>
        	<li>
        		<span>创建时间:</span>
        		<i>2017-12-12 21:05:13</i>
        	</li>
        </ul>
        <div class='process'>
        	<div class='agree_status'>
        		<div class='info'>
        			<i class='iconfont icon-shenfenzheng'></i>
        			<p>
        				<span>王建国</span>
        				<span>发起申请</span>
        			</p>
        			<i class=" weui-icon weui-icon-success"></i>
        			<em class='create_date'>2017-12-21</em>
        		</div>
        		<div class='info'>
        			<i class='iconfont icon-shenfenzheng'></i>
        			<p>
        				<span>我</span>
        				<span>接受正在处理</span>
        			</p>
        			<i class="weui-icon weui-icon-warn"></i>
        			<em class='create_date'>2017-12-21</em>
        		</div>
        	</div>
        </div>
        
		
		
    </div>
</template>

<script>
export default{
	data(){
		return{

		}
	},
	created(){
		let str = location.href;
		var arr = str.split("?");
		var arr1 = arr[1].split("&");
		console.log(arr1[0].split("=")[1]);
	}
}
    
</script>

<style>
#td_detail{
	width:100%;
	position:absolute;
	left:0;
	top:0;
	bottom:0;
	z-index:100;	
	background: #fff;
}
.detail{
	width:100%;
	border-bottom: 1px solid #ccc;
	padding: 15px;
	font-size:20px;
	color:#000;
	font-weight: 700;
	text-align: center;
	position: relative;
}
.detail button{
	position: absolute;
	left: 15px;
	top:18px;
}
.detail .status1{
	width:50px;
	line-height: 20px;
	padding: 2px 0;
	text-align: center;
	color:#fff ;
	background:#10AEFF ;
	position:absolute;
	right: 15px;
	top:18px;
	font-size:12px;
}
#td_detail ul{
	border-bottom: 1px solid #ccc;
	padding: 15px;
}
#td_detail ul li{
	line-height: 30px;
	
}
ul li span{
	color:lightslategrey;
	
}
ul li i{
	color:#000;
}
.btn{
	width:100%;
	position: absolute;
	left:0;
	bottom: 10px;
}
.process{
	width:100%;
}
.process .agree_status{	
	margin:15px;
}
.agree_status .info{
	border:1px solid #ccc;
	padding: 10px;
	position: relative;
	margin-top:30px;
	vertical-align: middle;
}
.info .iconfont{
	position: absolute;
	top:12px;
}
.info p{
	display: inline-block;
	margin-left:30px;
}
.info p span{
	display: block;
}
.create_date{
	position: absolute;
	right:10px;
	top:3px;
}
.weui-icon{
	position:absolute;
	right:25px;
	top:28px;
}
</style>