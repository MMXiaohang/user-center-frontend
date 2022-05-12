// 封装localStorage 存取 token
// 使用window.localStorage中的方法来设置本地存储

const key = "pc-key";

const setToken = (token:string) => {
  return window.localStorage.setItem(key, token);
};

const getToken = () => {
  return window.localStorage.getItem(key);
};

const removeToken = () => {
  return window.localStorage.removeItem(key);
};

export { setToken, getToken, removeToken };
