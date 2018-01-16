<template>
  <div id="app">
    <keep-alive>
      <router-view v-wechat-title="$route.meta.title"></router-view>
    </keep-alive>
	  <nav class="navbar">
	    <router-link  v-for="tab in tablist" :to="tab.path">
	    	<span class="iconfont" :class="tab.icon"></span>
	      <p>{{tab.title}}</p>
	      <span class="weui-badge" style="position: absolute;top: 0;right:40%;">{{num}}</span>
	    </router-link>	
	  </nav>
  </div>
</template>

<script>
export default {
  data(){
    return {
        tablist:[
            {title:'我的待办',path:'/to_do',icon: 'icon-daiban'},
            {title:'我的已办',path:'/finish',icon:'icon-yiban'},            
				],
				num:"0"
    }
	},
	created(){
		this.$event.$on("num",(res)=>{
				this.num = res;
		})
	}
  
}
</script>

<style>
	.navbar{
	width:100%;
	height:49px;
	position: fixed;
	left:0;
	bottom:0;
	z-index:10;
	display: flex;
	background: #f8f8f8;
}
.navbar:before{
	content:'';
	display: block;
	height:1px;
	width:100%;
	border-top:1px solid #CCCCCC;
	position:absolute;
	top:-1px;
	left:0;
	transform: scaleY(0.5);
	
}
.navbar a{
	flex:1;
	text-align: center;
	color: #666;
	position: relative;
}
.navbar a:last-child .weui-badge{
	display: none;
}
.navbar .iconfont{
	display: block;
	width: 100%;
	text-align: center;
	color: #666;
	margin-top:4px;
}
.navbar a.router-link-active .iconfont{
	color: #10AEFF;
}
.navbar a.router-link-active p{
	color: #10AEFF;
}
.page{
	width:100%;
	position: absolute;
	left:0;
	top:0;
	bottom:49px;
	height: auto;
	
}
.slideInRight{
	animation-duration: 300ms;
	transition-delay: 0.5s;
}
.slideOutRight{
	animation-duration: 300ms;
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
	color:lightslategrey
}
li.no_task{
	text-align:center; 
	border:none;
	margin-top:30px;
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
