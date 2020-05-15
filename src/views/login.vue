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
            <div class="login-banner-roletask">路塔流程</div>
        </div>
        <div class="login-content">
            <div class="login-form" v-if="!isMobileLogin">
                <div class="login-text">登录</div>
                <group class="loginGroup">
                    <x-input 
                        :class="[isLoginInpFoc?'loginInpFoc':'loginInput']"  
                        @on-focus="isLoginInpFoc=true" 
                        @on-blur="isLoginInpFoc=false" 
                        text-align="left" 
                        placeholder="用户名" 
                        v-model="userCode">
                    </x-input>
                    <x-input 
                        :class="[isLoginInpFocS?'loginInpFoc':'loginInput']"  
                        @on-focus="isLoginInpFocS=true"  
                        @on-blur="isLoginInpFocS=false" 
                        text-align="left" 
                        placeholder="密码" 
                        v-model="passWord" 
                        type="password">
                    </x-input>
                </group>
                <div class="other-login">
                    <span class="mobile-login" @click="onMobileLoginClick">验证码登录</span>
                </div>
            </div>
            <div class="mobile-form" v-else>
                <div class="login-text">验证码登录</div>
                <group class="loginGroup">
                    <x-input
                        ref="mobile" 
                        placeholder="请输入手机号" 
                        keyboard="number" 
                        v-model="mobile"
                        is-type="china-mobile" 
                        :class="[isLoginInpFoc?'loginInpFoc':'loginInput']"  
                        @on-focus="isLoginInpFoc=true" 
                        @on-blur="isLoginInpFoc=false"
                        @keyup.native="onMobileChange">
                    </x-input>
                    <x-input 
                        class="weui-vcode" 
                        placeholder="请输入验证码"
                        v-model="testCode"
                        :class="[isLoginInpFocS?'loginInpFoc':'loginInput']"  
                        @on-focus="isLoginInpFocS=true" 
                        @on-blur="isLoginInpFocS=false">
                        <span
                            slot="right"
                            v-if="showTestCode"
                            :style="{color:isDisabled?'#ddd':'#39f'}" 
                            @click="sendTestCodeClick">
                            发送验证码
                        </span>
                        <span slot="right" v-else>{{ count }} s</span>
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
            let params = {
                userCode: this.userCode,
                password: this.passWord
            };
            tokenService.pcLogin(params).then(data=>{
                this.$router.replace('/home');
                localStorage.setItem('userCode',this.userCode);
            }).catch(err=>{
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
        sendTestCodeClick() {
            if(this.isDisabled) return;
            const constTime = 60;
            if (!this.timer) {
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
    }
    .login-content{
        margin: .4rem .2rem .2rem .2rem;
        border: 1px solid #ddd;
        padding: .2rem;
        border-radius: 5px;
        box-shadow: 0px 0px 6px 1px #ddd;
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
        .loginInput:before {
            font-size: 1em;
            border: none;
        }   
        .loginInput {
            font-size: 1em;
            padding-top: 0.3rem;
            width: 80%;
            margin: 0 auto;
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
         /deep/ .weui-cells:after {
            border: none;
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
        height: 0.5rem;
    }   
    .host-btn{
        height:0.5rem;
        width:90%;
    }
    .login-banner {
        width: 100%;
        text-align: center;
        // @include login_banner();
        img{
            height: 1rem;
            margin-top: 0.5rem;
            width: 1rem;
        }
        div{
            font-size: 18px;
            color: #3296fa;
            letter-spacing: 8px;
        }
    }
</style>
