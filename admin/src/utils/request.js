import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/auth';
import router from '../router';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// 请求拦截:自动带 token
request.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// 响应拦截:统一处理 { code, message, data }
request.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0) return body.data;
      // 业务错误
      ElMessage.error(body.message || '请求失败');
      return Promise.reject(new Error(body.message || '请求失败'));
    }
    return body;
  },
  (error) => {
    const status = error.response?.status;
    const body = error.response?.data;
    const message = body?.message || error.message;

    if (status === 401) {
      const auth = useAuthStore();
      auth.clear();
      ElMessage.error('登录已过期,请重新登录');
      router.replace('/login');
    } else if (status === 403) {
      ElMessage.error(message || '无权限');
    } else {
      ElMessage.error(message || '网络错误');
    }
    return Promise.reject(error);
  }
);

export default request;
