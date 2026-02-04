import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

// --- NEWS API ---

export const getPosts = async (url = `${API_URL}/posts/`, clubSlug = null) => {
    try {
        const targetUrl = new URL(url);
        
        if (clubSlug) {
            targetUrl.searchParams.set('club__slug', clubSlug);
        }

        const response = await axios.get(targetUrl.toString());
        return response.data;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return { results: [], next: null, previous: null };
    }
};

export const getClubs = async () => {
    try {
        const response = await axios.get(`${API_URL}/clubs/`);
        return response.data; 
    } catch (error) {
        console.error("Error fetching clubs:", error);
        return [];
    }
};

// --- AUTH API ---

export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/auth/login/`, { username, password });
    return response.data;
};

export const logout = async () => {
    await axios.post(`${API_URL}/auth/logout/`);
};

export const getUser = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth/user/`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const register = async (username, email, password) => {
    // Send password twice as password1 and password2 required by dj-rest-auth default
    const response = await axios.post(`${API_URL}/auth/registration/`, { 
        username, 
        email, 
        password1: password,
        password2: password 
    });
    return response.data;
};

// --- SOCIAL API ---

export const getComments = async (postId) => {
    const response = await axios.get(`${API_URL}/comments/?post=${postId}`);
    return response.data;
};

export const postComment = async (postId, text) => {
    const response = await axios.post(`${API_URL}/comments/`, { post: postId, text });
    return response.data;
};

export const toggleBookmark = async (postId) => {
    // Our backend is simple create-only for now, let's just try to create. 
    // If it exists, the backend silences error (as per my previous code).
    // Ideally we need a check or a specific toggle endpoint.
    // Let's assume create for now.
    const response = await axios.post(`${API_URL}/bookmarks/`, { post: postId });
    return response.data;
};
