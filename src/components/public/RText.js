import Vue from 'vue'
import fieldBase from 'mixins/fieldBase'

let rtext = Vue.component('r2Textfield', {
    props: ['cfg', 'values'],
    mixins: [fieldBase],
    watch: {
        values: {
            handler(values) {

            }
        }
    },
    render: function (c) {
        var self = this,
            cfg = this.cfg,
            values = this.values || {};
        //  暂时用textfield RNumber 还没有只读状态下的视图
        return ['r2Textfield', 'r2TextArea', 'r2Numberfield'].includes(cfg.xtype) ? c(
            'div',
            {
                attrs: {
                    class: 'cell each_property vux-1px-b',
                    style: this.hidden ? "display:none" : ""
                }
            },
            [
                c(
                    'label',
                    {
                        class: {
                            required: !cfg.allowBlank
                        }
                    },
                    cfg.fieldLabel
                ),
                cfg.readOnly == false ?
                    c(
                        'input',
                        {
                            attrs: {
                                type: 'text',
                                placeholder: '请输入',
                                value: values[cfg.fieldCode],
                                class: 'property_val'
                            },
                            on: {
                                focus: function () {
                                    event.currentTarget.select();
                                },
                                input: function (event) {
                                    var value = event.target.value;
                                    self.setValue(value);
                                    self.$emit('input', value)
                                }
                            }
                        }
                    ) : c(
                        'span',
                        {},
                        values[cfg.fieldCode] || '无'
                    )]

        ) : undefined;
    }
})
export default rtext;