/**
 * @author xiaoying
 * @description 数据实例状态标签指令
 * @prop status 实例数据值
 * @example  <Tag v-instanceStateDirective="{status:obj.status}"></Tag>
 */
function render (el, bind) {
    switch (bind.value.status) {
        case "已生效":
            el.style.backgroundColor = bind.value.color ? bind.value.color : '#4CAF50';
            break;
        case "草稿":
            el.style.backgroundColor = '#FFC107';
            break;
        case "进行中":
            el.style.backgroundColor = '#35baf6';
            break;
        case "已失效":
            el.style.backgroundColor = '#E91E63';
            break;
        case "已归档":
            el.style.backgroundColor = '#1f5ec5';
            break;
    }
}
const instanceStateDirective = {
    componentUpdated: function (el, binding) {
        render(el, binding);
    },
    inserted: function (el, binding) {
        render(el, binding);
    }
}

export default instanceStateDirective;
