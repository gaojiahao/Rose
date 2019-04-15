<template>
    <div class="login-container">
        <div class="login-banner"></div>
        <div class="login-form">
            <div class="login-text">登录</div>
            <group>
                <x-input class="loginInput" title="" text-align="left" placeholder="请输入用户名" v-model="userCode"></x-input>
                <x-input class="loginInput" title="" text-align="left" placeholder="请输入密码" v-model="passWord" type="password"></x-input>
            </group>
            <x-button class="login-btn" @click.native="login">
                登录
            </x-button>
        </div>
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
        }
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
        margin-left: 10%;
        margin-right: 10%;
        height: 2.5rem;
        background: #fff;
        box-shadow: 0px 6px 12px 0px #FAF5E7;
        .login-btn{
            margin-top: 10%;
            background: #7E0600;
            color: #fff;
        }
        .login-text {
            font-size: 1.5em;
            margin-left: 0.2rem;           
            font-weight: 800;
        }
        .loginInput {
            font-size: 1em;
            border: none;
            border-bottom: 1px solid #989898;
        }
        .group {
            border: none;
        }
    }
    .login-banner {
        width: 100%;
        height: 1.6rem;
        background: #111 url('../../assets/loginBanner.png') top / cover no-repeat;
    }
</style>
