<template>
    <div>
        <!-- 表单基本信息 -->
        <group title="表单基本信息">

            <x-input 
            title='交易类型'
            ></x-input>

            <x-input 
            title='经办主体'
            ></x-input>

            <popup-picker 
            title="经办人"
            :data="baseInfo.operator"
            ></popup-picker>

            <popup-picker 
            title="所属区域"
            :data="baseInfo.area"
            ></popup-picker>

            <popup-picker 
            title="经办部门"
            :data="baseInfo.department"
            ></popup-picker>

            <popup-picker 
            title="经办角色"
            :data="baseInfo.role"
            ></popup-picker>

        </group>
    </div>
</template>
<script>
import { Cell, Group, XInput, PopupPicker, XTextarea, numberComma } from 'vux'
export default {
    props:['baseInfo'],
    name:'spreadBaseInfo',
    components:{
        Cell,
        Group,
        XInput,
        PopupPicker,
        XTextarea,
    },
    filters:{
        numberComma
    },
}
</script>
