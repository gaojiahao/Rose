(function computedWidth(){

    let screenWidth = document.documentElement.clientWidth,
        width = 750;    //iPhone6的手机尺寸
    if ( screenWidth >= width ){
        document.documentElement.style.fontSize = '100px'
    }
    else{
       let fontsize = ( screenWidth / width )*100 + 'px';
       document.documentElement.style.fontSize = fontsize
    }
    //屏幕宽度变化时
    window.addEventListener('resize', computedWidth);
    //横竖屏切换时
    window.addEventListener('orientationchange', computedWidth);
})();

