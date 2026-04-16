import api from './axios'

export const subscriptionsApi = {
  plans:       ()       => api.get('/subscriptions/plans'),
  current:     ()       => api.get('/subscriptions/current'),
  history:     ()       => api.get('/subscriptions/history'),
  subscribe:   (data)   => api.post('/subscriptions/subscribe', data),
  cancel:      (id)     => api.post(`/subscriptions/${id}/cancel`),
  mpesaStatus: (cid)    => api.get(`/subscriptions/mpesa/status/${cid}`),
}
