<template>
    <div class="login-container">
        <div class="login-banner"></div>
        <div class="login-form">
            <div class="login-text">登录</div>
            <group class="loginGroup">
                <x-input :class="[isLoginInpFoc?'loginInpFoc':'loginInput']"  @on-focus="isLoginInpFoc=true" 
                 @on-blur="isLoginInpFoc=false" text-align="left" placeholder="请输入用户名" v-model="userCode"></x-input>
                <x-input :class="[isLoginInpFocS?'loginInpFoc':'loginInput']"  @on-focus="isLoginInpFocS=true"  
                @on-blur="isLoginInpFocS=false" text-align="left" placeholder="请输入密码" v-model="passWord" type="password"></x-input>
            </group>
        </div>
        <x-button class="login-btn" @click.native="login">
                登录
        </x-button>
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
        return {
            userCode: '',
            passWord: '',
            show: false,
            isLoginInpFoc: false,
            isLoginInpFocS: false
        }
    },
    methods: {
        login() {
            tokenService.pcLogin(this.userCode,this.passWord).then(data=>{
                this.$router.push('/home');
            }).catch(err=>{
                 this.$vux.alert.show({
                    content: err.message
                });
            });
        },
    },
    created() {
        this.$loading.hide();
    }
}
</script>
<style lang="scss" scoped>
    .login-container {
        background-color: #FDFBF6;
        height: 100%
    }
    .login-form {
        margin-top: 10%;
        margin-left: 6%;
        margin-right: 6%;
        height: 2.5rem;
        background: #fff;
        box-shadow: 0px 6px 12px 0px #FAF5E7;
        border-radius: 5px;
        .login-text {
            font-size: 1.8em;
            margin-left: 0.4rem;           
            font-weight: 800;
            padding-top: 5%;
        }
        .loginInput:before {
            font-size: 1em;
            border: none;
        }   
        .loginInput {
            font-size: 1em;
            border-bottom: 1px solid #989898;
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
        background: #7E0600;
        color: #fff;
        width: 90%;
        height: 0.5rem;
    }   
    .login-banner {
        width: 100%;
        height: 1.6rem;
        background: #111 url('../../assets/loginBanner.png') top / cover no-repeat;
    }
</style>
