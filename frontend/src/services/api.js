const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('yogaflow_token');

const headers = (withAuth = true) => {
  const h = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// Auth
export const apiSignup = (data) =>
  fetch(`${API_URL}/auth/signup`, { method: 'POST', headers: headers(false), body: JSON.stringify(data) }).then(handleResponse);

export const apiLogin = (email, password) =>
  fetch(`${API_URL}/auth/login`, { method: 'POST', headers: headers(false), body: JSON.stringify({ email, password }) }).then(handleResponse);

export const apiGoogleAuth = (data) =>
  fetch(`${API_URL}/auth/google`, { method: 'POST', headers: headers(false), body: JSON.stringify(data) }).then(handleResponse);

export const apiAdminLogin = (email, password) =>
  fetch(`${API_URL}/auth/admin-login`, { method: 'POST', headers: headers(false), body: JSON.stringify({ email, password }) }).then(handleResponse);

// Users
export const apiGetProfile = () =>
  fetch(`${API_URL}/users/profile`, { headers: headers() }).then(handleResponse);

export const apiUpdateProfile = (data) =>
  fetch(`${API_URL}/users/profile`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);

export const apiGetAllUsers = () =>
  fetch(`${API_URL}/users`, { headers: headers() }).then(handleResponse);

export const apiDeleteUser = (id) =>
  fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse);

// BMI
export const apiCalculateBMI = (weight, height) =>
  fetch(`${API_URL}/bmi`, { method: 'POST', headers: headers(), body: JSON.stringify({ weight, height }) }).then(handleResponse);

export const apiGetBMIHistory = () =>
  fetch(`${API_URL}/bmi/history`, { headers: headers() }).then(handleResponse);

export const apiGetBMIRecommendation = (recordId) =>
  fetch(`${API_URL}/bmi/recommendation/${recordId}`, { headers: headers() }).then(handleResponse);

// Products
export const apiGetProducts = () =>
  fetch(`${API_URL}/products`, { headers: headers(false) }).then(handleResponse);

export const apiAddProduct = (data) =>
  fetch(`${API_URL}/products`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);

export const apiUpdateProduct = (id, data) =>
  fetch(`${API_URL}/products/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);

export const apiDeleteProduct = (id) =>
  fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse);

// Orders
export const apiPlaceOrder = (data) =>
  fetch(`${API_URL}/orders`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);

export const apiGetMyOrders = () =>
  fetch(`${API_URL}/orders/my`, { headers: headers() }).then(handleResponse);

export const apiGetAllOrders = () =>
  fetch(`${API_URL}/orders`, { headers: headers() }).then(handleResponse);

export const apiUpdateOrderStatus = (id, status) =>
  fetch(`${API_URL}/orders/${id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) }).then(handleResponse);

// Chat (AI)
export const apiChat = (message) =>
  fetch(`${API_URL}/chat`, { method: 'POST', headers: headers(), body: JSON.stringify({ message }) }).then(handleResponse);

// Wellness Content
export const apiGetWellnessContent = (type) =>
  fetch(`${API_URL}/wellness/${type}`, { headers: headers(false) }).then(handleResponse);

export const apiAddWellnessContent = (type, data) =>
  fetch(`${API_URL}/wellness/${type}`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);

export const apiUpdateWellnessContent = (type, id, data) =>
  fetch(`${API_URL}/wellness/${type}/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);

export const apiDeleteWellnessContent = (type, id) =>
  fetch(`${API_URL}/wellness/${type}/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse);

// Progress
export const apiGetProgress = () =>
  fetch(`${API_URL}/progress`, { headers: headers() }).then(handleResponse);

export const apiLogActivity = (data) =>
  fetch(`${API_URL}/progress/log`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);

// Token management
export const setToken = (token) => localStorage.setItem('yogaflow_token', token);
export const removeToken = () => localStorage.removeItem('yogaflow_token');
export { getToken };
