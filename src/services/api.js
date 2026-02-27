const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getHeaders(withAuth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (withAuth) {
        const token = localStorage.getItem('token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function handleResponse(res) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
    return data;
}

// Auth
export const authAPI = {
    login: (email, password) =>
        fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password })
        }).then(handleResponse),

    register: (data) =>
        fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),

    getProfile: () =>
        fetch(`${API_URL}/auth/me`, { headers: getHeaders(true) }).then(handleResponse),

    updateProfile: (data) =>
        fetch(`${API_URL}/auth/me`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(data)
        }).then(handleResponse)
};

// Products
export const productsAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetch(`${API_URL}/products${query ? '?' + query : ''}`, { headers: getHeaders() }).then(handleResponse);
    },

    getById: (id) =>
        fetch(`${API_URL}/products/${id}`, { headers: getHeaders() }).then(handleResponse),

    getCategories: () =>
        fetch(`${API_URL}/products/categories/all`, { headers: getHeaders() }).then(handleResponse),

    create: (data) =>
        fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(data)
        }).then(handleResponse),

    update: (id, data) =>
        fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(data)
        }).then(handleResponse),

    delete: (id) =>
        fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        }).then(handleResponse)
};

// Cart
export const cartAPI = {
    get: () =>
        fetch(`${API_URL}/cart`, { headers: getHeaders(true) }).then(handleResponse),

    add: (product_id, quantity = 1) =>
        fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ product_id, quantity })
        }).then(handleResponse),

    update: (id, quantity) =>
        fetch(`${API_URL}/cart/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify({ quantity })
        }).then(handleResponse),

    remove: (id) =>
        fetch(`${API_URL}/cart/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        }).then(handleResponse),

    clear: () =>
        fetch(`${API_URL}/cart`, {
            method: 'DELETE',
            headers: getHeaders(true)
        }).then(handleResponse)
};

// Orders
export const ordersAPI = {
    create: (data) =>
        fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(data)
        }).then(handleResponse),

    getAll: () =>
        fetch(`${API_URL}/orders`, { headers: getHeaders(true) }).then(handleResponse),

    getById: (id) =>
        fetch(`${API_URL}/orders/${id}`, { headers: getHeaders(true) }).then(handleResponse),

    getAllAdmin: () =>
        fetch(`${API_URL}/orders/admin/all`, { headers: getHeaders(true) }).then(handleResponse),

    updateStatus: (id, status) =>
        fetch(`${API_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify({ status })
        }).then(handleResponse),

    markAsPaid: (id) =>
        fetch(`${API_URL}/orders/${id}/payment-status`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify({ payment_status: 'approved' })
        }).then(handleResponse),

    trackById: (id, email) =>
        fetch(`${API_URL}/orders/track/${id}?email=${encodeURIComponent(email)}`, {
            headers: getHeaders()
        }).then(handleResponse)
};

// Repairs
export const repairsAPI = {
    create: (data) =>
        fetch(`${API_URL}/repairs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),

    getAllAdmin: () =>
        fetch(`${API_URL}/repairs/admin/all`, { headers: getHeaders(true) }).then(handleResponse),

    updateStatus: (id, status) =>
        fetch(`${API_URL}/repairs/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify({ status })
        }).then(handleResponse)
};

// Payments
export const paymentsAPI = {
    createPreference: (order_id) =>
        fetch(`${API_URL}/payments/create-preference`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ order_id })
        }).then(handleResponse)
};

// Admin
export const adminAPI = {
    getStats: () =>
        fetch(`${API_URL}/admin/stats`, { headers: getHeaders(true) }).then(handleResponse),

    getSalesChart: () =>
        fetch(`${API_URL}/admin/sales-chart`, { headers: getHeaders(true) }).then(handleResponse),

    getTopProducts: () =>
        fetch(`${API_URL}/admin/top-products`, { headers: getHeaders(true) }).then(handleResponse)
};

// Format price in ARS
export function formatPrice(cents) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(cents / 100);
}

// Format date
export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Order status labels
export const orderStatusLabels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    processing: 'En proceso',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
};
