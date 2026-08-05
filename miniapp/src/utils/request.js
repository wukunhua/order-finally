import { getToken, clearAuth } from './storage';

// H5 走 vite 代理(/api);小程序端直接请求后端完整地址,部署时改成你的服务器域名
// #ifdef H5
const BASE = '/api';
// #endif
// #ifndef H5
const BASE = 'https://shbus.top/api';
// #endif

function request(options) {
  const { url, method = 'GET', data, header = {}, silent = false } = options;
  const token = getToken();
  if (token) header.Authorization = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE + url,
      method,
      data,
      header: { 'Content-Type': 'application/json', ...header },
      success: (res) => {
        const body = res.data || {};
        if (res.statusCode === 401) {
          clearAuth();
          if (!silent) uni.showToast({ title: '请重新登录', icon: 'none' });
          return reject(new Error('未登录'));
        }
        if (res.statusCode === 403) {
          uni.showToast({ title: body.message || '无权限', icon: 'none' });
          return reject(new Error(body.message || '无权限'));
        }
        if (body && typeof body === 'object' && 'code' in body) {
          if (body.code === 0) return resolve(body.data);
          if (!silent) uni.showToast({ title: body.message || '请求失败', icon: 'none' });
          return reject(new Error(body.message || '请求失败'));
        }
        resolve(body);
      },
      fail: (err) => {
        // 把真实失败原因打到 vConsole,便于定位(域名白名单/SSL/超时等)
        // eslint-disable-next-line no-console
        console.warn('[request fail]', options.url, err && (err.errMsg || err));
        if (!silent) uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      },
    });
  });
}

export const http = {
  get: (url, data, opts) => request({ url, method: 'GET', data, ...opts }),
  post: (url, data, opts) => request({ url, method: 'POST', data, ...opts }),
  patch: (url, data, opts) => request({ url, method: 'PATCH', data, ...opts }),
  put: (url, data, opts) => request({ url, method: 'PUT', data, ...opts }),
  del: (url, data, opts) => request({ url, method: 'DELETE', data, ...opts }),
};

export default http;
