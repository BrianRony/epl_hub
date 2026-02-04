import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const getPosts = async (url = `${API_URL}/posts/`, clubSlug = null) => {
    try {
        // If a clubSlug is provided, we append it as a filter
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

// NEW FUNCTION
export const getClubs = async () => {
    try {
        const response = await axios.get(`${API_URL}/clubs/`);
        return response.data; 
    } catch (error) {
        console.error("Error fetching clubs:", error);
        return [];
    }
};
