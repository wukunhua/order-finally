import request from '../utils/request';

// ---- 鉴权 ----
export const authApi = {
  adminLogin: (data) => request.post('/auth/admin/login', data),
  profile: () => request.get('/auth/profile'),
};

// ---- 用户 ----
export const userApi = {
  list: (params) => request.get('/users', { params }),
  setStatus: (id, status) => request.patch(`/users/${id}/status`, { status }),
  setRole: (id, role) => request.patch(`/users/${id}/role`, { role }),
};

// ---- 分类 ----
export const categoryApi = {
  list: (params) => request.get('/categories', { params }),
  create: (data) => request.post('/categories', data),
  update: (id, data) => request.put(`/categories/${id}`, data),
  remove: (id) => request.delete(`/categories/${id}`),
};

// ---- 菜品 ----
export const dishApi = {
  list: (params) => request.get('/dishes', { params }),
  create: (data) => request.post('/dishes', data),
  update: (id, data) => request.put(`/dishes/${id}`, data),
  remove: (id) => request.delete(`/dishes/${id}`),
};

// ---- 订单 ----
export const orderApi = {
  list: (params) => request.get('/orders', { params }),
  detail: (id) => request.get(`/orders/${id}`),
  setStatus: (id, status) => request.patch(`/orders/${id}/status`, { status }),
};

// ---- 上传 ----
export const uploadImage = (file) => {
  const form = new FormData();
  form.append('file', file);
  return request.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
