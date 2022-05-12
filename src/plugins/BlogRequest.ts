/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import {extend} from 'umi-request';
import {getToken, setToken} from '@/utils/token';
import {message} from "antd";

/**
 * 配置request请求时的默认参数
 */
const blogRequest = extend({
  credentials: 'include', // 默认请求是否带上cookie
  prefix: 'http://geek.itheima.net/v1_0',
  // requestType: 'form',
});

/**
 * 全局请求拦截器
 */
blogRequest.interceptors.request.use((url, options): any => {
  console.log(`do request url = ${url}`);
  // 添加token
  const token = getToken();
  const authHeader = { Authorization: 'Bearer ${token}' };
  return {
    url : `${url}`,
    options: {
      ...options,
      interceptors: true,
      headers: authHeader,
    },
  };
}, { global: false });

/**
 * 全局响应拦截器
 */
blogRequest.interceptors.response.use(async (response, options): Promise<any> => {
  const res = await response.clone().json();
  console.log(res);
  setToken(res.data.token);
  if(res.response.status === 401){
    message.error('博客系统登录出错');
  }
  return res.data.message;
}, { global: false });

export default blogRequest;
