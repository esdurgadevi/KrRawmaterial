export const login = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  localStorage.setItem('token', res.data.token);
  return res.data;
};

export const register = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const isAuthenticated = () => !!localStorage.getItem('token');