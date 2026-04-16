import api from './axios'

export const messagesApi = {
  conversations:   ()          => api.get('/messages/conversations'),
  conversation:    (userId)    => api.get(`/messages/conversations/${userId}`),
  send:            (data)      => api.post('/messages/send', data),
  unreadCount:     ()          => api.get('/messages/unread'),
  markRead:        (id)        => api.patch(`/messages/${id}/read`),
  delete:          (id)        => api.delete(`/messages/${id}`),
}
