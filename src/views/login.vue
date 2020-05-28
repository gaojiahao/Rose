<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-05-29 11:46:54
 * @LastEditors: Gabriel.gaojiahao
 * @LastEditTime: 2019-11-29 11:03:42
 -->
<template>
    <div class="login-container">
        <div class="login-banner">
            <img src='./../assets/default/login/logo.png' />
            <div class="login-banner-roletask">Roletask</div>
            <div class="login-banner-solgan">路塔柔性流程</div>
        </div>
        <div class="login-content">
            <div class="login-form" v-if="!isMobileLogin">
                <group class="loginGroup">
                    <x-input 
                        :class="[isLoginInpFoc?'loginInpFoc':'loginInput']"  
                        @on-focus="isLoginInpFoc=true" 
                        @on-blur="onUserCodeBlur" 
                        text-align="left" 
                        :showClear="false"
                        placeholder="请输入手机号/账号"     
                        v-model="userCode">
                        <i slot="right" class="weui-icon weui-icon-clear" v-show="isLoginInpFoc && userCode!=''" @click="userCode=''"></i>
                    </x-input>
                    <x-input 
                        :class="[isLoginInpFocS?'loginInpFoc':'loginInput']"  
                        @on-focus="isLoginInpFocS=true"  
                        @on-blur="onPassWordBlur" 
                        text-align="left" 
                        :showClear="false"
                        placeholder="请输入密码" 
                        v-model="passWord" 
                        type="password">
                        <i slot="right" class="weui-icon weui-icon-clear" v-show="isLoginInpFocS && passWord!=''" @click="passWord=''"></i>
                    </x-input>
                </group>
                <div class="other-login">
                    <span class="mobile-login" @click="onMobileLoginClick">验证码登录</span>
                </div>
            </div>
            <div class="mobile-form" v-else>
                <group class="loginGroup">
                    <x-input
                        ref="mobile" 
                        placeholder="请输入手机号" 
                        keyboard="number" 
                        v-model="mobile"
                        is-type="china-mobile" 
                        :showClear="false"
                        :class="[isLoginInpFoc?'loginInpFoc':'loginInput']"  
                        @on-focus="isLoginInpFoc=true" 
                        @on-blur="onUserCodeBlur"
                        @keyup.native="onMobileChange">
                    <i slot="right" class="weui-icon weui-icon-clear" v-show="isLoginInpFoc && mobile!=''" @click="mobile=''"></i>
                    </x-input>
                    <x-input 
                        class="weui-vcode" 
                        placeholder="请输入验证码"
                        v-model="testCode"
                        :class="[isLoginInpFocS?'loginInpFoc':'loginInput']"
                        :showClear="false"  
                        @on-focus="isLoginInpFocS=true" 
                        @on-blur="onPassWordBlur">
                        <div slot="right">
                            <i class="weui-icon weui-icon-clear" v-show="isLoginInpFocS && testCode!=''" @click="testCode=''"></i>&nbsp;&nbsp;
                            <span
                                v-if="showTestCode"
                                :style="{color:isDisabled?'#ddd':'#39f'}" 
                                @click="sendTestCodeClick">
                                发送验证码
                            </span>
                            <span v-else>{{ count }}</span>
                        </div>
                    </x-input>
                </group>
                <div class="other-login">
                    <span class="mobile-login" @click="onMobileLoginClick">账号密码登录</span>
                </div>
            </div>
            <x-button class="login-btn" @click.native="login">
                    登录
            </x-button>
        </div>
        
        <!-- <x-button v-if="isApp" class="host-btn" @click.native="goSetHost">切换服务器</x-button> -->
    </div>
    
</template>
<script>
import {Group, XInput, XButton} from 'vux'
import tokenService from 'service/tokenService'
import commonService from 'service/commonService'
// import $axios from '../plugins/ajax'
// import axios from 'axios'
export default {
    components: {
        Group,
        XInput,
        XButton
    },
    data() {
        var  isApp = window.isApp,
             userCode = localStorage.getItem('userCode');
        return {
            userCode: userCode,
            isApp:isApp,
            passWord: '',
            mobile: '',
            testCode: '',
            show: false,
            isLoginInpFoc: false,
            isLoginInpFocS: false,
            isMobileLogin: false,
            showTestCode: true,
            isDisabled: true,
            theme:'',
            count: 60
        }
    },
    methods: {
        login() {
            let params = {};
            if(this.isMobileLogin){
                if(!this.mobile || !this.testCode){
                    this.$vux.toast.show({text: '请输入有效的手机号或验证码！'});
                    return;
                }
                params.userCode = this.mobile;
                params.password = this.testCode;
                params.loginMode = 1;
            }else{
                if(!this.userCode || !this.passWord){
                    this.$vux.toast.show({text: '请输入用户名或密码！'});
                    return;
                }
                params.userCode = this.userCode;
                params.password = this.passWord;
            }

            this.$loading.show();
            tokenService.pcLogin(params).then(data=>{
                var app = this.getApp();
                commonService.clearWebContext();//清空缓存
                if(app.dsClient){//关闭之前的deepstream链接
                    app.dsClient.close();
                    app.dsClient = null;
                }
                this.$router.replace('/');
                this.$loading.hide();
                localStorage.setItem('userCode',this.userCode);
            }).catch(err=>{
                this.$loading.hide();
                this.$vux.alert.show({
                    content: err.message
                });
            });
        },
        goSetHost:function () {
            this.$router.push('/setHost');
        },
        onMobileLoginClick() {
            this.isMobileLogin = !this.isMobileLogin;
        },
        onMobileChange(value) {
            if(this.$refs['mobile'].valid) {
                this.isDisabled = false;
            }else{
                this.isDisabled = true;
            }
        },
        onUserCodeBlur:function(){
            var vm = this;
            setTimeout(function(){
               vm.isLoginInpFoc=false
            });
        },
        onPassWordBlur:function(){
            var vm = this;
            setTimeout(function(){
               vm.isLoginInpFocS=false
            });
        },
        clearTestCode:function(){
            this.testCode = '';
        },
        sendTestCodeClick() {
            if(this.isDisabled) return;
            const constTime = 60;
            if (!this.timer) {
                //发送验证码
                tokenService.sendTestCode(this.mobile).then(data => {
                    if(data.success){
                        this.$vux.toast.show({text: data.message});
                        this.showTestCode = false;
                        this.timer = setInterval(() => {
                            if (this.count > 0 && this.count <= constTime) {
                                this.count--;
                            } else {
                                this.showTestCode = true;
                                clearInterval(this.timer);
                                this.timer = null;
                            }
                        }, 1000)
                    }
                }).catch(err => {
                    this.$vux.alert.show({
                        content: err.message
                    });
                });
            }
        }
    },
    created() {
        this.$loading.hide();
        this.getApp().hasTab = false;
    },
    beforeRouteLeave:function(to,from,next){
        this.getApp().hasTab = true;
        next();
    }
}
</script>
<style lang="scss" scoped>
    .login-container {
        height: 100%;
        background-color: white;
    }
    .login-content{
        
        
    }
    .login-form,.mobile-form {
        background: #fff;
        .other-login{
            text-align: right;
            .mobile-login{
                color: #999;
                padding-right: .3rem;
                padding-top: .1rem;
                display: inline-block;
            }
        }
        .login-text {
            font-size: 1.15em;
            text-align: center;
        } 
        .loginInput {
            font-size: 1em;
            padding-top: 0.3rem;
            width: 80%;
            margin: 0 auto;
            border-bottom: 1px solid #eee;
        }
        /deep/ .weui-cell:before{
            border: none;
        }
        /deep/ .weui-cells:after{
            border: none;
        }
        .loginInpFoc:before {
            font-size: 1em;
            border: none;
        }   
        .loginInpFoc {
            border-bottom: 1px solid #7E0600;
            @extend .loginInput
        }    
    }
    .loginGroup {
         /deep/ .weui-cells:before {
            border: none !important;
        }
        /deep/ .weui-cells {
            margin-top: 0;
        }
    }
    .login-btn{
        margin-top: 0.4rem;
        @include bg_color();
        color: #fff;
        width: 90%;
    }   
    .host-btn{
        height:0.5rem;
        width:90%;
    }
    .login-banner {
        width: 100%;
        text-align: center;
        margin-bottom: .5rem;
        // @include login_banner();

        img{
            height: 1rem;
            margin-top: 0.5rem;
            width: 1rem;
        }
        &-roletask{
            font-size: 18px;
            color: #3296fa;
            font-family: fantasy;
            letter-spacing: 2px;
        }

        &-solgan{
            letter-spacing: 10px;
        }
    }
</style>
