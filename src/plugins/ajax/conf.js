/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-04-09 14:05:57
 * @LastEditors: Gabriel.gaojiahao
 * @LastEditTime: 2019-12-05 11:37:22
 */
/**
 * corpid 企微-公司的id
 * secret 企微-企业应用secret
 */

// 测试使用 174 Roletask
// export const corpid = 'ww3c1aa17c16e380b7'; // 企业id
// export const secret = '5DdrQJT9GlFvmBR87a7Df7dTqBskPlPDUnjKi_YZbOg'; // 应用凭证
// export const agentid = '1000036'; // 企业应用的id
// export const redirect_uri = 'http%3A%2F%2Fcpacn2012.3322.org%3A1174%2FHermes%2Fhome'; // 首页路径

// 172 Roletask （开发自用）
// export const corpid = 'ww3c1aa17c16e380b7'; // 企业id
// export const secret = 'E7XH-mR0hJ5R27xFpIxAu8a6isDolgwpcPD3WN3ZIBs'; // 应用凭证
// export const agentid = '1000038'; // 企业应用的id
// export const redirect_uri = 'http%3A%2F%2Fcpacn2012.3322.org%3A1172%2FHermes%2Fhome'; // 首页路径

// 175 Roletask 
// export const corpid = 'ww3c1aa17c16e380b7'; // 企业id
// export const secret = '_MTqTVltBKS_HVBPbM00zHAdC0NpLNtcGvpTD0BQjC4'; // 应用凭证
// export const agentid = '1000039'; // 企业应用的id
// export const redirect_uri = 'http%3A%2F%2Fcpacn2012.3322.org%3A1175%2FHermes%2Fhome'; // 首页路径

// 178 Roletask
// export const corpid = 'ww3c1aa17c16e380b7'; // 企业id
// export const secret = 'Z5p2RZTwRRNFF5UKmfK3XsO3DVs9zmS7K6_mR1nQQmo'; // 应用凭证
// export const agentid = '1000041'; // 企业应用的id
// export const redirect_uri = 'http%3A%2F%2Fcpacn2012.3322.org%3A1178%2FHermes%2Fhome'; // 首页路径

// refordom Roletask
// export const corpid = 'ww3c1aa17c16e380b7'; // 企业id
// export const secret = 'z3a2Yz1B_RxeTD2WBkMDmqD49xp8qykhY96A1ZdxeMQ'; // 应用凭证
// export const agentid = '1000037'; // 企业应用的id
// export const redirect_uri = 'https%3a%2f%2frefordom.roletask.com%2fHermes%2findex.html'; // 首页路径

// 七感
// export const corpid = 'wwa7ec2d7f7c4390a1'; // 企业id
// export const secret = '9mPAeKBUdLju-roDzZFo2E2LzbgdrnSuLQ46dr_xutI'; // 应用凭证
// export const agentid = '1000002'; // 企业应用的id
// export const redirect_uri = 'https%3a%2f%2f7senses.roletask.com%2fHermes'; // 首页路径

// ZooCoffee

// export const corpid = 'ww16b87431cd6fb4f1'; // 企业id
// export const secret = '4qeG9ge1wNjxBP6PBgqo01pG--RSWrZBGasBc57IMGY'; // 应用凭证
// export const agentid = '1000002'; // 企业应用的id
// export const redirect_uri = 'https%3a%2f%2fZooCoffee.roletask.com%2fHermes'; // 首页路径

export const corpid = window.ROLETASK_LoginConfig && window.ROLETASK_LoginConfig.qw_appid; // 企业id
export const secret = window.ROLETASK_LoginConfig && window.ROLETASK_LoginConfig.qw_secret; // 应用凭证
export const agentid = window.ROLETASK_LoginConfig && window.ROLETASK_LoginConfig.qw_agentid; // 企业应用的id
export const redirect_uri = window.ROLETASK_LoginConfig && window.ROLETASK_LoginConfig.qw_redirect_uri_mobile; // 首页路径
export const redirect_uri_share = window.ROLETASK_LoginConfig && window.ROLETASK_LoginConfig.qw_redirect_uri_mobile_share; // 分享路径

export default {
  corpid,
  secret,
  agentid,
  redirect_uri,
};

