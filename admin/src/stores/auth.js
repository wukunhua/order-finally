import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '');
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setAuth(tokenVal, userVal) {
    token.value = tokenVal;
    user.value = userVal;
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('user', JSON.stringify(userVal));
  }

  function clear() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async function login(username, password) {
    const data = await authApi.adminLogin({ username, password });
    setAuth(data.token, data.user);
    return data;
  }

  async function refreshProfile() {
    if (!token.value) return null;
    try {
      const u = await authApi.profile();
      user.value = u;
      localStorage.setItem('user', JSON.stringify(u));
      return u;
    } catch (e) {
      return null;
    }
  }

  return { token, user, isLoggedIn, isAdmin, setAuth, clear, login, refreshProfile };
});
