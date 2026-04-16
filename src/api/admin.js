import api from './axios'

export const adminApi = {
  dashboard:               ()           => api.get('/admin/dashboard'),
  photographers:           (params)     => api.get('/admin/photographers', { params }),
  updatePhotographerStatus:(id, status) => api.patch(`/admin/photographers/${id}/status`, { status }),
  manageSubscription:      (id, action) => api.post(`/admin/photographers/${id}/subscription`, { action }),
  reports:                 (params)     => api.get('/admin/reports', { params }),
  resolveReport:           (id)         => api.patch(`/admin/reports/${id}/resolve`),
  dismissReport:           (id)         => api.patch(`/admin/reports/${id}/dismiss`),
  locations:               ()           => api.get('/admin/locations'),
  createLocation:          (data)       => api.post('/admin/locations', data),
  updateLocation:          (id, data)   => api.put(`/admin/locations/${id}`, data),
  deleteLocation:          (id)         => api.delete(`/admin/locations/${id}`),
  categories:              ()           => api.get('/admin/categories'),
  createCategory:          (data)       => api.post('/admin/categories', data),
  updateCategory:          (id, data)   => api.put(`/admin/categories/${id}`, data),
  deleteCategory:          (id)         => api.delete(`/admin/categories/${id}`),
}

// Ratings (added for admin ratings view)
export const ratingsAdminApi = {
  list:   ()   => api.get('/admin/ratings'),
  delete: (id) => api.delete(`/admin/ratings/${id}`),
}
