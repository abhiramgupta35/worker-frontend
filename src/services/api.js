import axios from 'axios';

const api = axios.create({
    baseURL: 'https://worker-management-fou0.onrender.com/api/',
});

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
    getDaily: (date) => api.get('daily-report/', { params: { date } }),
};

export default api;
