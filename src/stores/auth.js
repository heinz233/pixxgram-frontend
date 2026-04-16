import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('authToken') || null)
  const loading = ref(false)
  const error   = ref(null)

  const isLoggedIn     = computed(() => !!token.value)
  const isAdmin        = computed(() => user.value?.role?.name === 'admin')
  const isPhotographer = computed(() => user.value?.role?.name === 'photographer')
  const isClient       = computed(() => user.value?.role?.name === 'client')
  const roleName       = computed(() => user.value?.role?.name || null)

  function _persist(userData, tokenValue) {
    user.value  = userData
    token.value = tokenValue
    localStorage.setItem('authToken', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  async function login(credentials) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await authApi.login(credentials)
      if (!data.token || !data.user) throw new Error('Invalid response from server')
      _persist(data.user, data.token)
      return data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(formData) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await authApi.register(formData)
      // Registration returns user but no token until email verified
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try { await authApi.logout() } catch (_) {}
    user.value  = null
    token.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  async function fetchMe() {
    try {
      const { data } = await authApi.me()
      user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch (_) {}
  }

  return {
    user, token, loading, error,
    isLoggedIn, isAdmin, isPhotographer, isClient, roleName,
    login, register, logout, fetchMe,
  }
})
