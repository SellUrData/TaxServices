const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    
    // Document endpoints
    DOCUMENTS: `${API_BASE_URL}/documents`,
    UPLOAD_DOCUMENT: `${API_BASE_URL}/documents/upload`,
    
    // Client endpoints
    CLIENT: `${API_BASE_URL}/client`,
    
    // Admin endpoints
    ADMIN: `${API_BASE_URL}/admin`,
};

export default API_ENDPOINTS;
