import http from '../utils/request';

export const authApi = {
  profile: () => http.get('/auth/profile'),
};

export const categoryApi = {
  list: () => http.get('/categories'),
};

export const dishApi = {
  list: (params) => http.get('/dishes', params),
};

export const orderApi = {
  create: (items, remark) => http.post('/orders', { items, remark }),
  list: (params) => http.get('/orders', params),
};
