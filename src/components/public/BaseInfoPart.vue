<template>
    <div class="baseinfopart">
        <div class="baseinfopart-header">
            <div>
                <strong>{{values['handlerUnitName']}}</strong>>
                <strong>{{values['handlerRoleName']}}</strong>>
                <strong>{{values['handlerName']}}</strong>
            </div>
            <div  @click="styleType=!styleType;">
                <i class="style-toogleBar" :class="styleType?'icon-up':'icon-down'"></i>
            </div>
        </div>
        <div v-if="styleType">
            <template v-for="(item, index) in fields">
                <div class="cell each_property " :key="index">
                    <span >{{item.fieldLabel}}</span>
                    <span >{{values[item.fieldCode]}}</span>
                </div>
            </template>
        </div>

    </div>
</template>

<script>
import Vue from "vue";
import util from '@/common/util';
var component = {
    props: ["fields","values"],
    data(){
        return {
            styleType:0
        }
    }
}
export default Vue.component("RBaseInfoPart", component);
</script>

<style  lang="scss" scoped>
.baseinfopart{
    padding: 0.05rem 0;
    .each_property{
        height: 0.2rem;
    }
    &-header{
        display: flex;
        justify-content: space-between;
    }
}
</style>
