import $flyio from 'plugins/ajax'

// 获取视图列表
export let getFieldSetting = () => {
    return $flyio.ajax({
      url: `/H_roleplay-si/ds/getFieldSetting`,
    })
};