import api from './axios'

export const photographersApi = {
  list:          (params)  => api.get('/photographers', { params }),
  show:          (id)      => api.get(`/photographers/${id}`),
  updateProfile: (data)    => api.put('/photographer/profile', data),
  uploadPortfolio:(data)   => api.post('/photographer/portfolio', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  dashboard:     ()        => api.get('/photographer/dashboard'),
  rate:          (id, data)=> api.post(`/photographers/${id}/rate`, data),
  ratings:       (id)      => api.get(`/photographers/${id}/ratings`),
}
