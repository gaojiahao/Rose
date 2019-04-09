<template>
    <div class="login-form">
        <group>
            <x-input title="用户名" text-align="right" placeholder="请输入用户名" v-model="username"></x-input>
            <x-input title="密码" text-align="right" placeholder="请输入密码" v-model="password" type="password"></x-input>
        </group>
        <x-button class="login-btn" :gradients="['#B99763', '#E7D0A2']" @click.native="login">
            登录
        </x-button>
    </div>
</template>
<script>
import {Group, XInput, XButton} from 'vux'
export default {
    components: {
        Group,
        XInput,
        XButton
    },
    data() {
        return {
            username: '',
            password: ''
        }
    },
    methods: {
        login() {
             if (!this.username){
                this.$vux.alert.show({
                content: '请输入用户名'
                });
                 return;
            }
            if (!this.password){
                this.$vux.alert.show({
                content: '请输入密码'
                });
                return;
            }
        }
    }
}
</script>
<style lang="scss" scoped>
    .login-form {
        padding-top: 10%;
        padding-left: 10%;
        padding-right: 10%;
        .login-btn{
            margin-top: 10%
        }
    }
</style>

