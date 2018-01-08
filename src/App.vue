<template>
  <div id="app">
    <keep-alive>
      <router-view v-wechat-title="$route.meta.title"></router-view>
    </keep-alive>
	  <nav class="navbar">
	    <router-link  v-for="tab in tablist" :to="tab.path" :key="tab.title">
				<span style="position:relative;">
					<span class="iconfont" :class="tab.icon">
					</span>
					<span class="weui-badge" style="position: absolute;top: -28px;right:-16px;">8</span>     
				</span> 
			 	<p>{{tab.title}}</p>
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
        ]
    }
  }
  
}
</script>

<style>
	.navbar{
	width:100%;
	height:49px;
	position: absolute;
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
	cursor:pointer;
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
	position:relative;
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
}
</style>
