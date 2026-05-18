import axios from 'axios';

const api = axios.create({
    baseURL: 'https://worker-management-fou0.onrender.com/api/',
});

export const TOKEN_KEY = 'wm_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Attach token (if any) to every request
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

// On 401, clear token and bounce to /login (unless we're already on the login page or hitting auth endpoints)
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            const url = err.config?.url || '';
            if (!url.includes('auth/login') && !url.includes('auth/register')) {
                clearToken();
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(err);
    }
);

export const authService = {
    login: (username, password) => api.post('auth/login/', { username, password }),
    logout: () => api.post('auth/logout/'),
    me: () => api.get('auth/me/'),
};

export const workerService = {
    getAll: () => api.get('workers/'),
    create: (data) => api.post('workers/', data),
    getById: (id) => api.get(`workers/${id}/`),
    toggleActive: (id) => api.post(`workers/${id}/toggle_active/`),
    delete: (id) => api.delete(`workers/${id}/`),
};

export const ownerService = {
    getAll: () => api.get('owners/'),
    create: (data) => api.post('owners/', data),
    getDetails: (id, date) => api.get(`owners/${id}/details/`, { params: date ? { date } : {} }),
    delete: (id) => api.delete(`owners/${id}/`),
    collectPayment: (id, data) => api.post(`owners/${id}/collect_payment/`, data),
};

export const assignmentService = {
    getAll: () => api.get('assignments/'),
    create: (data) => api.post('assignments/', data),
    toggleActive: (id) => api.post(`assignments/${id}/toggle_active/`),
    deleteAssignment: (id) => api.delete(`assignments/${id}/remove/`),
    updateAmount: (id, amount) => api.patch(`assignments/${id}/update_amount/`, { amount }),
};

export const paymentService = {
    create: (data) => api.post('payments/', data),
};

export const reportService = {
    getDaily: (date) => api.get('daily-report/', { params: { period: 'day', date } }),
    // params: { period: 'day'|'month'|'year', date?, month?, year? }
    get: (params) => api.get('daily-report/', { params }),
};

export default api;
