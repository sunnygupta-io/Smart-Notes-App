import axios from 'axios';
import { useAuthStore } from '../store/authStore';


const client = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true
});

let isRefreshing = false;
let refreshSubscribers: ((error: any) => void)[] = [];

// Add a request to the queue
const subscribeTokenRefresh = (cb: (error: any) => void) => {
    refreshSubscribers.push(cb);
};

//  Process the queue when refresh finishes
const onRefreshed = (error:any) => {
    refreshSubscribers.forEach((cb) => cb(error));
    refreshSubscribers = []; // Clear the queue
};

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isRefreshEndpoint = originalRequest.url?.includes('/users/refresh');
        const isLoginEndpoint = originalRequest.url?.includes('/users/login');

        // Check if it's a 401 that needs a refresh
        if (
            error.response?.status === 401 && 
            !originalRequest._retry && 
            !isRefreshEndpoint &&
            !isLoginEndpoint
        ) {
            originalRequest._retry = true;

            // We are NOT refreshing yet. Be the first to start it.
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    await axios.post(
                        'http://localhost:8000/api/users/refresh',
                        {}, 
                        { withCredentials: true }
                    );

                    isRefreshing = false;
                    // Tell all waiting requests in the queue to proceed 
                    onRefreshed(null); 

                    // Retry the very first original request
                    return client(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;
                    // Tell all waiting requests in the queue to fail
                    onRefreshed(refreshError); 
                    useAuthStore.getState().logout();
                    redirectToLogin();
                    return Promise.reject(refreshError);
                }
            }

            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((err: any) => {
                    if (err) {
                        reject(err); 
                    } else {
                        resolve(client(originalRequest));
                    }
                });
            });
        }
        
        return Promise.reject(error);
    }
);

function redirectToLogin() {
    const currentPath = window.location.pathname;
    
    if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/auth/google/callback') {
        window.location.href = '/login';
    }
}

export default client;