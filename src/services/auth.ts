import axios from 'axios';

// DEMO mode: when true, simulate auth locally (no backend required)
const DEMO_MODE = true;

const API_URL = 'http://localhost:8000/api';

interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  is_staff: boolean;
}

export interface RegisterPayload {
  username: string;
  email?: string;
  password: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  if (DEMO_MODE) {
    // In demo, accept any credentials. If username contains 'admin', mark as staff.
    const isStaff = /admin/i.test(username);
    const demoResp: LoginResponse = {
      token: `demo-${Date.now()}`,
      user_id: 1,
      username,
      is_staff: isStaff,
    };
    localStorage.setItem('token', demoResp.token);
    localStorage.setItem('user', JSON.stringify({ id: demoResp.user_id, username: demoResp.username, isStaff }));
    return demoResp;
  }
  const response = await axios.post(`${API_URL}/auth/login/`, { username, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({ id: response.data.user_id, username: response.data.username, isStaff: response.data.is_staff }));
  }
  return response.data;
};

export const register = async (payload: RegisterPayload): Promise<LoginResponse> => {
  if (DEMO_MODE) {
    // Simulate account creation and immediate login
    const isStaff = /admin/i.test(payload.username);
    const demoResp: LoginResponse = {
      token: `demo-${Date.now()}`,
      user_id: 2,
      username: payload.username,
      is_staff: isStaff,
    };
    localStorage.setItem('token', demoResp.token);
    localStorage.setItem('user', JSON.stringify({ id: demoResp.user_id, username: demoResp.username, isStaff }));
    return demoResp;
  }
  const response = await axios.post(`${API_URL}/auth/register/`, payload);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({ id: response.data.user_id, username: response.data.username, isStaff: response.data.is_staff }));
  }
  return response.data;
};

export const logout = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (DEMO_MODE) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return;
  }
  if (token) {
    try {
      await axios.post(`${API_URL}/auth/logout/`, {}, { headers: { Authorization: `Token ${token}` } });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

export const isAdmin = (): boolean => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;
  
  try {
    const user = JSON.parse(userStr);
    return user.isStaff === true;
  } catch (e) {
    return false;
  }
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Token ${token}` } : {};
};