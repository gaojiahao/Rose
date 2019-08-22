import Bscroll from 'better-scroll'
export default {
    data(){
        return {
            isScroll: false, //显示固定元素
            scrollY: '',
        }
    },
    methods:{
        toReferrals(){
            this.fillBscroll.scrollTo(0,0);
        }
    },
    mounted(){
        this.$loading.hide();

        this.$nextTick(() => {
            this.fillBscroll = new Bscroll(this.$refs.fill, {
                probeType: 3,
                scrollY: true,
                click: true,
                useTransition:false,  // 防止iphone微信滑动卡顿
                bounce:true,
                momentumLimitDistance: 5
            })
            this.fillBscroll.on('scroll',(pop)=>{
                    var tops = this.$refs.wmsMatterPart.offsetTop;
                    // 使用abs绝对值（否则 pop.y拿到值是负数）
                    this.scrollY = Math.abs(Math.round(pop.y));
                    //判断滑动距离大于"箱码明细"元素时, 吸顶title,否则隐藏
                    if(this.scrollY >= tops) {
                        this.isScroll = true;
                    }else {
                        this.isScroll = false;
                    }
            })
        })
    }
}