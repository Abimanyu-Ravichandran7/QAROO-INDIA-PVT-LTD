import { get, post, del } from './api.js';

export const contactApi = {
  submit: (data) => post('/contact', data),
  list: (params) => get('/contact', params),
  get: (id) => get(`/contact/${id}`),
  toggleRead: (id) => post(`/contact/${id}/read`),
  resolve: (id) => post(`/contact/${id}/resolve`),
  remove: (id) => del(`/contact/${id}`),
};
