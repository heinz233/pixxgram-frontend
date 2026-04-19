import api from './axios'

export const adminApi = {
  // Dashboard
  dashboard: () => api.get('/admin/dashboard'),

  // Photographers
  photographers:            (params)     => api.get('/admin/photographers', { params }),
  updatePhotographerStatus: (id, status) => api.patch(`/admin/photographers/${id}/status`, { status }),
  manageSubscription:       (id, action) => api.post(`/admin/photographers/${id}/subscription`, { action }),

  // Users
  users:            (params) => api.get('/admin/users', { params }),
  toggleUserActive: (id)     => api.patch(`/admin/users/${id}/toggle-active`),

  // Reports
  reports:       (params) => api.get('/admin/reports', { params }),
  resolveReport: (id)     => api.patch(`/admin/reports/${id}/resolve`),
  dismissReport: (id)     => api.patch(`/admin/reports/${id}/dismiss`),

  // Ratings
  ratings:      (params) => api.get('/admin/ratings', { params }),
  deleteRating: (id)     => api.delete(`/admin/ratings/${id}`),

  // Subscriptions
  subscriptions: (params) => api.get('/admin/subscriptions', { params }),

  // Bookings (for activity feed)
  bookings: (params) => api.get('/admin/bookings', { params }),

  // Locations
  locations:      ()           => api.get('/admin/locations'),
  createLocation: (data)       => api.post('/admin/locations', data),
  updateLocation: (id, data)   => api.put(`/admin/locations/${id}`, data),
  deleteLocation: (id)         => api.delete(`/admin/locations/${id}`),

  // Categories
  categories:     ()           => api.get('/admin/categories'),
  createCategory: (data)       => api.post('/admin/categories', data),
  updateCategory: (id, data)   => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id)         => api.delete(`/admin/categories/${id}`),
}
