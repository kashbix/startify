import axios from 'axios';

// Point this to your FastAPI backend URL
const API_URL = 'http://localhost:8000/api/v1'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// This "Interceptor" runs before every request.
// It grabs the user's login token from LocalStorage and attaches it to the request.
api.interceptors.request.use(
  (config) => {
    // Assuming you save your login token to localStorage as 'token'
    // Adjust 'token' if you named it something else (like 'access_token')
    const token = localStorage.getItem('token'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;