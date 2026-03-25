// src/services/auth.service.js
const API_URL = 'http://10.104.126.179:3000/api/api/v1/users'; // Nota el doble /api/api/

export const authService = {
  async register(userData) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Error en el registro');
    return await response.json();
  },

  async login(credentials) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Credenciales inválidas');
    const data = await response.json();

    // Guardamos el token en localStorage
    if (data.token) {
      localStorage.setItem('userToken', data.token);
    }
    return data;
  },

  logout() {
    localStorage.removeItem('userToken');
  }
};