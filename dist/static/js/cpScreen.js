onload = function(){
    //原型图为iPhone6 宽度为640
    function computedScreen(){
        //获取页面宽度
        var screenWidth = document.documentElement.clientWidth;
        //设置原型图宽度
        var width = 640;
        //判断是否符合宽度 不符合则另外匹配
        if(screenWidth>=width){
            document.documentElement.style.fontSize = '100px'
            
        }else{
            var fontsize = (screenWidth/width) * 100 + 'px'
            document.documentElement.style.fontSize = fontsize;
        }
    }
    //进入页面时调用
    computedScreen();
    //页面宽度变化时调用
    window.addEventListener('resize',computedScreen);
    //横竖屏切换时调用
    window.addEventListener('orientationchange',computedScreen);
    
}