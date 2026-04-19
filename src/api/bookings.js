import api from './axios'

export const bookingsApi = {
  list:          ()                  => api.get('/bookings'),
  show:          (id)                => api.get(`/bookings/${id}`),
  create:        (data)              => api.post('/bookings', data),
  updateStatus:  (id, status)        => api.patch(`/bookings/${id}/status`, { status }),
  pay:           (id, phone, amount) => api.post(`/bookings/${id}/pay`, { phone, amount }),
  paymentStatus: (id)                => api.get(`/bookings/${id}/payment-status`),
}
