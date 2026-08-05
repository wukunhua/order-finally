// 纯本地存储辅助:不依赖任何其它模块,打破 request <-> auth 的循环依赖
const TOKEN_KEY = 'os_token';
const USER_KEY = 'os_user';

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || '';
}
export function setToken(t) {
  uni.setStorageSync(TOKEN_KEY, t);
}
export function getUser() {
  return uni.getStorageSync(USER_KEY) || null;
}
export function setUser(u) {
  uni.setStorageSync(USER_KEY, u);
}
export function clearAuth() {
  uni.removeStorageSync(TOKEN_KEY);
  uni.removeStorageSync(USER_KEY);
}
