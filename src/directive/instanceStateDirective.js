/**
 * @author xiaoying
 * @description 数据实例状态标签指令
 * @prop status 实例数据值
 * @example  <Tag v-instanceStateDirective="{status:obj.status}"></Tag>
 */
function render (el, bind) {
    //状态（1：已生效，2：进行中，0：草稿，-1：已失效，-2：已删除，-3：已归档）

    if(typeof(bind.value.status) === 'number'){
        switch (bind.value.status) {
            case 1:
                el.innerText = '已生效';
                el.style.backgroundColor = bind.value.color ? bind.value.color : '#4CAF50';
                break;
            case 0:
                el.innerText = '草稿';
                el.style.backgroundColor = '#FFC107';
                break;
            case 2:
                el.innerText = '进行中';
                el.style.backgroundColor = '#35baf6';
                break;
            case -1:
                el.innerText = '已失效';
                el.style.backgroundColor = '#E91E63';
                break;
            case -2:
                el.innerText = '已删除';
                el.style.backgroundColor = '#1f5ec5';
                break;
            case -3:
                el.innerText = '已归档';
                el.style.backgroundColor = '#1f5ec5';
                break;
        }
    }else{
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
