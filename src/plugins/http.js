//  封装axios
// 实例化 请求拦截器 响应拦截器
import axios from "axios";
import { getToken } from "@/utils/token";
import { history } from "@/utils/history";

const http = axios.create({
  baseURL: "http://geek.itheima.net/v1_0",
  timeout: 5000,
});

// 添加请求拦截器
http.interceptors.request.use(
  (config) => {
    // 在拦截器中给请求头添加token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
http.interceptors.response.use(
  // 2xx 范围内的状态码会触发该函数
  (response) => {
    return response.data;
  },
  // 相应出错状态码
  (error) => {
    console.dir(error);
    // 401 状态码是未认证
    if (error.response.status === 401) {
      // 跳回到登录默认状态下
      console.log("login");
      history.push("/login");
    }
    return Promise.reject(error);
  }
);

export { http };
