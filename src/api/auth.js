import api from './axios'

export const authApi = {
  login:       (data)      => api.post('/login', data),
  register:    (data)      => api.post('/register', data),
  logout:      ()          => api.post('/logout'),
  me:          ()          => api.get('/user'),
  resendEmail: (email)     => api.post('/email/verification-notification', { email }),
}
