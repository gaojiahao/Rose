<template>
    <div class="weui-skin_android">
        <div class="weui-mask" @click="$parent.showContextMenu = false;$emit('off')"></div>
        <div class="weui-actionsheet">
            <div class="weui-actionsheet__menu">
                <div class="weui-actionsheet__cell" @click="$emit('replay')">回复</div>
                <div class="weui-actionsheet__cell" @click="$emit('copy')" >复制</div>
            </div>
        </div>
    </div>
</template>
